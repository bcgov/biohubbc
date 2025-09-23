import { SOURCE_SYSTEM } from '../constants/database';
import { COLLECTION_ROLE, SURVEY_ROLE, SYSTEM_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { CollectionMember } from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { SurveyMember } from '../repositories/survey-member-repository';
import { getKeycloakSource, getUserGuid, KeycloakUserInformation } from '../utils/keycloak-utils';
import { CollectionMemberService } from './collection-member-service';
import { DBService } from './db-service';
import { SurveyMemberService } from './survey-member-service';
import { UserService } from './user-service';

enum AuthorizeOperator {
  AND = 'and',
  OR = 'or'
}

/**
 * Authorization rule that checks if a user's system role matches at least one of the required system roles.
 *
 * @export
 * @interface AuthorizeBySystemRoles
 */
export interface AuthorizeBySystemRoles {
  validSystemRoles: SYSTEM_ROLE[];
  discriminator: 'SystemRole';
}

/**
 * Authorization rule that checks if a user is a known and active user of the system.
 *
 * @export
 * @interface AuthorizeBySystemUser
 */
interface AuthorizeBySystemUser {
  discriminator: 'SystemUser';
}

/**
 * Authorization rule that checks if a jwt token's client id matches at least one of the required client ids.
 *
 * Note: This is specifically for system-to-system communication.
 *
 * @export
 * @interface AuthorizeByServiceClient
 */
export interface AuthorizeByServiceClient {
  validServiceClientIDs: SOURCE_SYSTEM[];
  discriminator: 'ServiceClient';
}

type AuthorizeBySurveyRoleBySurveyId = {
  validSurveyRoles: SURVEY_ROLE[];
  surveyId: number;
  discriminator: 'SurveyRole';
};

type AuthorizeByCollectionRoleByCollectionId = {
  validCollectionRoles: COLLECTION_ROLE[];
  collectionId: number;
  discriminator: 'CollectionRole';
};

export type AuthorizeBySurveyRole = AuthorizeBySurveyRoleBySurveyId;

export type AuthorizeByCollectionRole = AuthorizeByCollectionRoleByCollectionId;

export type AuthorizeRule =
  | AuthorizeBySystemRoles
  | AuthorizeBySystemUser
  | AuthorizeByServiceClient
  | AuthorizeBySurveyRole
  | AuthorizeByCollectionRole;

type AuthorizeConfigOr = {
  [AuthorizeOperator.AND]?: never;
  [AuthorizeOperator.OR]: AuthorizeRule[];
};

type AuthorizeConfigAnd = {
  [AuthorizeOperator.AND]: AuthorizeRule[];
  [AuthorizeOperator.OR]?: never;
};

export type AuthorizationScheme = AuthorizeConfigAnd | AuthorizeConfigOr;

export class AuthorizationService extends DBService {
  _userService = new UserService(this.connection);
  _surveyMemberService = new SurveyMemberService(this.connection);
  _collectionMemberService = new CollectionMemberService(this.connection);
  _systemUser: SystemUserWithRoles | undefined = undefined;
  _surveyUser: (SurveyMember & SystemUserWithRoles) | undefined = undefined;
  _collectionUser: (CollectionMember & SystemUserWithRoles) | undefined = undefined;
  _keycloakToken: KeycloakUserInformation | undefined = undefined;

  constructor(
    connection: IDBConnection,
    init?: {
      systemUser?: SystemUserWithRoles;
      surveyUser?: SurveyMember & SystemUserWithRoles;
      keycloakToken?: KeycloakUserInformation;
    }
  ) {
    super(connection);

    this._systemUser = init?.systemUser;
    this._surveyUser = init?.surveyUser;
    this._keycloakToken = init?.keycloakToken;
  }

  /**
   * Execute the `authorizationScheme` against the current user, and return `true` if they have access, `false` otherwise.
   *
   * @param {AuthorizationScheme} authorizationScheme
   * @return {*}  {Promise<boolean>} `true` if the `authorizationScheme` indicates the user has access, `false` otherwise.
   */
  async executeAuthorizationScheme(authorizationScheme: AuthorizationScheme): Promise<boolean> {
    if (authorizationScheme.and) {
      return (await this.executeAuthorizeConfig(authorizationScheme.and)).every((item) => item);
    } else {
      return (await this.executeAuthorizeConfig(authorizationScheme.or)).some((item) => item);
    }
  }

  /**
   * Execute an array of `AuthorizeRule`, returning an array of boolean results.
   *
   * @param {AuthorizeRule[]} authorizeRules
   * @return {*}  {Promise<boolean[]>}
   */
  async executeAuthorizeConfig(authorizeRules: AuthorizeRule[]): Promise<boolean[]> {
    const authorizeResults: boolean[] = [];

    for (const authorizeRule of authorizeRules) {
      switch (authorizeRule.discriminator) {
        case 'SystemRole':
          authorizeResults.push(await this.authorizeBySystemRole(authorizeRule));
          break;
        case 'SystemUser':
          authorizeResults.push(await this.authorizeBySystemUser());
          break;
        case 'ServiceClient':
          authorizeResults.push(await this.authorizeByServiceClient(authorizeRule));
          break;
        case 'SurveyRole':
          authorizeResults.push(await this.authorizeBySurveyRole(authorizeRule));
          break;
        case 'CollectionRole':
          authorizeResults.push(await this.authorizeByCollectionRole(authorizeRule));
          break;
      }
    }

    return authorizeResults;
  }

  async authorizeBySurveyRole(authorizeSurveyRole: AuthorizeBySurveyRole): Promise<boolean> {
    if (!authorizeSurveyRole || !authorizeSurveyRole.surveyId) {
      // Cannot verify user permissions
      return false;
    }

    let surveyUserObject;

    surveyUserObject = this._surveyUser || (await this.getSurveyMemberBySurveyId(authorizeSurveyRole.surveyId));

    console.log('SURVEY USER OBJECT###', surveyUserObject, this._surveyUser);

    if (!surveyUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _surveyUser for future use, if needed
    this._surveyUser = surveyUserObject;

    if (surveyUserObject.record_end_date) {
      // system user has an expired record
      return false;
    }

    // Check if the user has at least 1 of the valid survey permissions
    return AuthorizationService.hasAtLeastOneValidValue(
      authorizeSurveyRole.validSurveyRoles,
      surveyUserObject.survey_role_name
    );
  }

  async authorizeByCollectionRole(authorizeCollectionRole: AuthorizeByCollectionRole): Promise<boolean> {
    if (!authorizeCollectionRole?.collectionId) {
      // Cannot verify user permissions
      return false;
    }

    const collectionUserObjects = await this.getParentCollectionMembersWithRolesByCollectionId(
      authorizeCollectionRole.collectionId
    );

    if (!collectionUserObjects.length) {
      // No roles found for this user in the collection hierarchy
      return false;
    }

    // Check if user has at least one valid collection role
    const userRoles = collectionUserObjects.map((record) => record.collection_role_name);
    return AuthorizationService.hasAtLeastOneValidValue(authorizeCollectionRole.validCollectionRoles, userRoles);
  }

  /**
   * Check if the user has the system administrator role.
   *
   * @return {*}  {boolean} `true` if the user is a system administrator, `false` otherwise.
   */
  async authorizeSystemAdministrator(): Promise<boolean> {
    const systemUserObject = this._systemUser || (await this.getSystemUserObject());

    if (!systemUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _systemUser for future use, if needed
    this._systemUser = systemUserObject;

    if (systemUserObject.record_end_date) {
      // system user has an expired record
      return false;
    }

    return systemUserObject.role_names.includes(SYSTEM_ROLE.SYSTEM_ADMIN);
  }

  /**
   * Check that the user has at least one of the valid system roles specified in `authorizeSystemRoles.validSystemRoles`.
   *
   * @param {AuthorizeBySystemRoles} authorizeSystemRoles
   * @return {*}  {boolean} `true` if the user has at least one valid system role role, or no valid system roles are
   * specified; `false` otherwise.
   */
  async authorizeBySystemRole(authorizeSystemRoles: AuthorizeBySystemRoles): Promise<boolean> {
    if (!authorizeSystemRoles) {
      // Cannot verify user roles
      return false;
    }

    const systemUserObject = this._systemUser || (await this.getSystemUserObject());

    if (!systemUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _systemUser for future use, if needed
    this._systemUser = systemUserObject;

    if (systemUserObject.record_end_date) {
      // system user has an expired record
      return false;
    }

    // Check if the user has at least 1 of the valid roles
    return AuthorizationService.hasAtLeastOneValidValue(
      authorizeSystemRoles.validSystemRoles,
      systemUserObject.role_names
    );
  }

  /**
   * Check if the user is a valid system user.
   *
   * @return {*}  {Promise<boolean>} `Promise<true>` if the user is a valid system user, `Promise<false>` otherwise.
   */
  async authorizeBySystemUser(): Promise<boolean> {
    const systemUserObject = this._systemUser || (await this.getSystemUserObject());

    if (!systemUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _systemUser for future use, if needed
    this._systemUser = systemUserObject;

    if (systemUserObject.record_end_date) {
      // system user has an expired record
      return false;
    }

    // User is a valid system user
    return true;
  }

  /**
   * Check if the user is a valid system client.
   *
   * @return {*}  {Promise<boolean>} `Promise<true>` if the user is a valid system user, `Promise<false>` otherwise.
   */
  async authorizeByServiceClient(authorizeServiceClient: AuthorizeByServiceClient): Promise<boolean> {
    if (!this._keycloakToken) {
      // Cannot verify token source
      return false;
    }

    const source = getKeycloakSource(this._keycloakToken);

    if (!source) {
      // Cannot verify token source
      return false;
    }

    return AuthorizationService.hasAtLeastOneValidValue(authorizeServiceClient.validServiceClientIDs, source);
  }

  /**
   * Compares an array of incoming values against an array of valid values.
   *
   * @param {(string | string[])} validValues valid values to match against
   * @param {(string | string[])} incomingValues incoming values to check against the valid values
   * @return {*} {boolean} true if the incomingValues has at least 1 of the validValues or no valid values are
   * specified, false otherwise
   */
  static hasAtLeastOneValidValue = function (
    validValues: string | string[],
    incomingValues: string | string[]
  ): boolean {
    if (!validValues || !validValues.length) {
      return true;
    }

    if (!Array.isArray(validValues)) {
      validValues = [validValues];
    }

    if (!Array.isArray(incomingValues)) {
      incomingValues = [incomingValues];
    }

    for (const validRole of validValues) {
      if (incomingValues.includes(validRole)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Fetch the user's system user object.
   *
   * @return {*}  {(Promise<SystemUserWithRoles | null>)}
   * @memberof AuthorizationService
   */
  async getSystemUserObject(): Promise<SystemUserWithRoles | null> {
    let systemUserWithRoles;

    try {
      systemUserWithRoles = await this.getSystemUserWithRoles();
    } catch {
      return null;
    }

    if (!systemUserWithRoles) {
      return null;
    }

    return systemUserWithRoles;
  }

  /**
   * Finds a single system user based on their keycloak token information.
   *
   * @return {*}  {(Promise<SystemUserWithRoles | null>)}
   */
  async getSystemUserWithRoles(): Promise<SystemUserWithRoles | null> {
    if (!this._keycloakToken) {
      return null;
    }

    const userGuid = getUserGuid(this._keycloakToken);

    return this._userService.getUserByGuid(userGuid);
  }

  /**
   * Get the collection member record for any parent of the given collection id (recursively walk up the tree)
   *
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles)[]>)}
   */
  async getParentCollectionMembersWithRolesByCollectionId(
    collectionId: number
  ): Promise<(CollectionMember & SystemUserWithRoles)[]> {
    if (!this._keycloakToken) {
      return [];
    }

    const userGuid = getUserGuid(this._keycloakToken);

    return this._collectionMemberService.getParentCollectionMemberByCollectionIdAndUserGuid(collectionId, userGuid);
  }

  /**
   * Fetches the survey member with system roles for the current user and given survey ID.
   *
   * @param {number} surveyId
   * @returns {Promise<(SurveyMember & SystemUserWithRoles) | null>}
   */
  async getSurveyMemberBySurveyId(surveyId: number): Promise<(SurveyMember & SystemUserWithRoles) | null> {
    if (!this._keycloakToken) {
      return null;
    }

    const userGuid = getUserGuid(this._keycloakToken);
    const member = await this._surveyMemberService.getSurveyMemberBySurveyIdAndUserGuid(surveyId, userGuid);

    return member ?? null;
  }

  /**
   * Given a `AuthorizeBySurveyRole`, determine which of its possible subtypes it is.
   *
   * @param {AuthorizeBySurveyRole} value
   * @memberof AuthorizationService
   */
  isAuthorizeBySurveyRolesBySurveyId = (value: AuthorizeBySurveyRole): value is AuthorizeBySurveyRoleBySurveyId => {
    return value.surveyId !== undefined && value.surveyId === undefined;
  };
}
