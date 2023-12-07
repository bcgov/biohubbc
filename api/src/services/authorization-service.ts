import { SOURCE_SYSTEM } from '../constants/database';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ProjectUser } from '../repositories/project-participation-repository';
import { SystemUser } from '../repositories/user-repository';
import { getKeycloakSource, getUserGuid, KeycloakUserInformation } from '../utils/keycloak-utils';
import { DBService } from './db-service';
import { ProjectParticipationService } from './project-participation-service';
import { UserService } from './user-service';

export enum AuthorizeOperator {
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
export interface AuthorizeBySystemUser {
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

export interface AuthorizeByProjectPermission {
  validProjectPermissions: PROJECT_PERMISSION[];
  projectId: number;
  discriminator: 'ProjectPermission';
}

export type AuthorizeRule =
  | AuthorizeBySystemRoles
  | AuthorizeBySystemUser
  | AuthorizeByServiceClient
  | AuthorizeByProjectPermission;

export type AuthorizeConfigOr = {
  [AuthorizeOperator.AND]?: never;
  [AuthorizeOperator.OR]: AuthorizeRule[];
};

export type AuthorizeConfigAnd = {
  [AuthorizeOperator.AND]: AuthorizeRule[];
  [AuthorizeOperator.OR]?: never;
};

export type AuthorizationScheme = AuthorizeConfigAnd | AuthorizeConfigOr;

export class AuthorizationService extends DBService {
  _userService = new UserService(this.connection);
  _projectParticipationService = new ProjectParticipationService(this.connection);
  _systemUser: SystemUser | undefined = undefined;
  _projectUser: (ProjectUser & SystemUser) | undefined = undefined;
  _keycloakToken: KeycloakUserInformation | undefined = undefined;

  constructor(
    connection: IDBConnection,
    init?: { systemUser?: SystemUser; projectUser?: ProjectUser & SystemUser; keycloakToken?: KeycloakUserInformation }
  ) {
    super(connection);

    this._systemUser = init?.systemUser;
    this._projectUser = init?.projectUser;
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
        case 'ProjectPermission':
          authorizeResults.push(await this.authorizeByProjectPermission(authorizeRule));
          break;
      }
    }

    return authorizeResults;
  }

  async authorizeByProjectPermission(authorizeProjectPermission: AuthorizeByProjectPermission): Promise<boolean> {
    if (!authorizeProjectPermission) {
      // Cannot verify user permissions
      return false;
    }

    if (this._projectUser?.project_id !== authorizeProjectPermission.projectId) {
      // A projectUser was previously cached, but for a different project
      this._projectUser = undefined;
    }

    const projectUserObject =
      this._projectUser || (await this.getProjectUserObject(authorizeProjectPermission.projectId));
    if (!projectUserObject) {
      // Cannot verify user roles
      return false;
    }

    // Cache the _systemUser for future use, if needed
    this._projectUser = projectUserObject;
    if (projectUserObject.record_end_date) {
      //system user has an expired record
      return false;
    }

    // Check if the user has at least 1 of the valid project permissions
    return AuthorizationService.hasAtLeastOneValidValue(
      authorizeProjectPermission.validProjectPermissions,
      projectUserObject.project_role_permissions
    );
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
      //system user has an expired record
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
   * @return {*}  {(Promise<SystemUser | null>)}
   * @memberof AuthorizationService
   */
  async getSystemUserObject(): Promise<SystemUser | null> {
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
   * @return {*}  {(Promise<SystemUser | null>)}
   */
  async getSystemUserWithRoles(): Promise<SystemUser | null> {
    if (!this._keycloakToken) {
      return null;
    }

    const userGuid = getUserGuid(this._keycloakToken);

    return this._userService.getUserByGuid(userGuid);
  }

  /**
   * Fetch the user's project user object.
   *
   * @param {number} projectId
   * @return {*}  {(Promise<(ProjectUser & SystemUser) | null>)}
   */
  async getProjectUserObject(projectId: number): Promise<(ProjectUser & SystemUser) | null> {
    let projectUserWithRoles;

    try {
      projectUserWithRoles = await this.getProjectUserWithRoles(projectId);
    } catch {
      return null;
    }

    if (!projectUserWithRoles) {
      return null;
    }

    return projectUserWithRoles;
  }

  /**
   * Finds a single project user based on their keycloak token information.
   *
   * @param {number} projectId
   * @return {*}  {(Promise<(ProjectUser & SystemUser) | null>)}
   */
  async getProjectUserWithRoles(projectId: number): Promise<(ProjectUser & SystemUser) | null> {
    if (!this._keycloakToken) {
      return null;
    }

    const userGuid = getUserGuid(this._keycloakToken);

    return this._projectParticipationService.getProjectParticipantByUserGuid(projectId, userGuid);
  }
}
