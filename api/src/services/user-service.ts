import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { IDBConnection } from '../database/db';
import { ApiBuildSQLError, ApiExecuteSQLError } from '../errors/api-error';
import { UserObject } from '../models/user';
import { queries } from '../queries/queries';
import { UserRepository } from '../repositories/user-repository';
import {
  isBceidBusinessUserInformation,
  isDatabaseUserInformation,
  isIdirUserInformation,
  KeycloakUserInformation
} from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';

export type ListSystemUsers = {
  id: number;
  user_identifier: string;
  record_end_date: string;
  role_ids: number[];
  role_names: string[];
};

const defaultLog = getLogger('services/user-service');

/**
 * @TODO Replace all implementations of `queries/users/user-queries` with appropriate UserRepository methods.
 */
export class UserService extends DBService {
  userRepository: UserRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.userRepository = new UserRepository(connection);
  }

  /**
   * Fetch a single system user by their system user ID.
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<UserObject>)}
   * @memberof UserService
   */
  async getUserById(systemUserId: number): Promise<UserObject> {
    const response = await this.userRepository.getUserById(systemUserId);

    return new UserObject(response);
  }

  /**
   * Get an existing system user by their GUID.
   *
   * @param {string} userGuid The user's GUID
   * @return {*}  {(Promise<UserObject | null>)}
   * @memberof UserService
   */
  async getUserByGuid(userGuid: string): Promise<UserObject | null> {
    defaultLog.debug({ label: 'getUserByGuid', userGuid });

    const response = await this.userRepository.getUserByGuid(userGuid);

    if (response.length !== 1) {
      return null;
    }

    return new UserObject(response[0]);
  }

  /**
   * Get an existing system user by their user identifier and identity source.
   *
   * @param userIdentifier the user's identifier
   * @param identitySource the user's identity source, e.g. `'IDIR'`
   * @return {*}  {(Promise<UserObject | null>)} Promise resolving the UserObject, or `null` if the user wasn't found.
   * @memberof UserService
   */
  async getUserByIdentifier(userIdentifier: string, identitySource: string): Promise<UserObject | null> {
    defaultLog.debug({ label: 'getUserByIdentifier', userIdentifier, identitySource });

    const response = await this.userRepository.getUserByIdentifier(userIdentifier, identitySource);

    if (response.length !== 1) {
      return null;
    }

    return new UserObject(response[0]);
  }

  /**
   * Adds a new system user.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {string} displayName
   * @param {string} email
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async addSystemUser(
    userGuid: string | null,
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string
  ): Promise<UserObject> {
    const response = await this.userRepository.addSystemUser(
      userGuid,
      userIdentifier,
      identitySource,
      displayName,
      email
    );

    return new UserObject(response);
  }

  /**
   * Get a list of all system users.
   *
   * @return {*}  {Promise<UserObject[]>}
   * @memberof UserService
   */
  async listSystemUsers(): Promise<UserObject[]> {
    const response = await this.userRepository.listSystemUsers();

    return response.map((row) => new UserObject(row));
  }

  /**
   * Gets a system user, adding them if they do not already exist, or activating them if they had been deactivated (soft
   * deleted).
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {string} displayName
   * @param {string} email
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async ensureSystemUser(
    userGuid: string | null,
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string
  ): Promise<UserObject> {
    // Check if the user exists in SIMS
    let userObject = userGuid
      ? await this.getUserByGuid(userGuid)
      : await this.getUserByIdentifier(userIdentifier, identitySource);

    if (!userObject) {
      // Id of the current authenticated user
      const systemUserId = this.connection.systemUserId();

      if (!systemUserId) {
        throw new ApiExecuteSQLError('Failed to identify system user ID');
      }

      // Found no existing user, add them
      userObject = await this.addSystemUser(userGuid, userIdentifier, identitySource, displayName, email);
    }

    if (!userObject.record_end_date) {
      // system user is already active
      return userObject;
    }

    // system user is not active, re-activate them
    await this.activateSystemUser(userObject.id);

    // get the newly activated user
    return this.getUserById(userObject.id);
  }

  /**
   * Activates an existing system user that had been deactivated (soft deleted).
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<UserObject>)}
   * @memberof UserService
   */
  async activateSystemUser(systemUserId: number) {
    const sqlStatement = queries.users.activateSystemUserSQL(systemUserId);

    if (!sqlStatement) {
      throw new ApiBuildSQLError('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to activate system user');
    }
  }

  /**
   * Deactivates an existing system user (soft delete).
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<UserObject>)}
   * @memberof UserService
   */
  async deactivateSystemUser(systemUserId: number) {
    const sqlStatement = queries.users.deactivateSystemUserSQL(systemUserId);

    if (!sqlStatement) {
      throw new ApiBuildSQLError('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to deactivate system user');
    }
  }

  /**
   * Delete all system roles for the user.
   *
   * @param {number} systemUserId
   * @memberof UserService
   */
  async deleteUserSystemRoles(systemUserId: number) {
    const sqlStatement = queries.users.deleteAllSystemRolesSQL(systemUserId);

    if (!sqlStatement) {
      throw new ApiBuildSQLError('Failed to build SQL delete statement');
    }

    await this.connection.query(sqlStatement.text, sqlStatement.values);
  }

  /**
   * Adds the specified roleIds to the user.
   *
   * @param {number} systemUserId
   * @param {number[]} roleIds
   * @memberof UserService
   */
  async addUserSystemRoles(systemUserId: number, roleIds: number[]) {
    const sqlStatement = queries.users.postSystemRolesSQL(systemUserId, roleIds);

    if (!sqlStatement) {
      throw new ApiBuildSQLError('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert user system roles');
    }
  }

  /**
   * Update a system user's record with the latest information from a verified Keycloak token.
   *
   * Note: Does nothing if the user is an internal database user.
   *
   * @param {KeycloakUserInformation} keycloakUserInformation
   * @return {*}  {(Promise<number | null>)} the system user id, if a matching system user record was found and updated,
   * otherwise null.
   * @memberof UserService
   */
  async updateSystemUserInformation(keycloakUserInformation: KeycloakUserInformation): Promise<number | null> {
    let values;

    if (isDatabaseUserInformation(keycloakUserInformation)) {
      // Don't patch internal database user records
      return null;
    }

    // We don't yet know at this point what kind of token was used (idir vs bceid basic, etc).
    // Determine which type it is, and parse the information into a generic structure
    if (isIdirUserInformation(keycloakUserInformation)) {
      values = {
        user_guid: keycloakUserInformation.idir_user_guid,
        user_identifier: keycloakUserInformation.idir_username,
        user_identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        display_name: keycloakUserInformation.display_name,
        email: keycloakUserInformation.email,
        given_name: keycloakUserInformation.given_name,
        family_name: keycloakUserInformation.family_name
      };
    } else if (isBceidBusinessUserInformation(keycloakUserInformation)) {
      values = {
        user_guid: keycloakUserInformation.bceid_user_guid,
        user_identifier: keycloakUserInformation.bceid_username,
        user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS,
        display_name: keycloakUserInformation.display_name,
        email: keycloakUserInformation.email,
        given_name: keycloakUserInformation.given_name,
        family_name: keycloakUserInformation.family_name,
        agency: keycloakUserInformation.bceid_business_name
      };
    } else {
      values = {
        user_guid: keycloakUserInformation.bceid_user_guid,
        user_identifier: keycloakUserInformation.bceid_username,
        user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
        display_name: keycloakUserInformation.display_name,
        email: keycloakUserInformation.email,
        given_name: keycloakUserInformation.given_name,
        family_name: keycloakUserInformation.family_name
      };
    }

    return this.userRepository.updateSystemUserInformation(values);
  }
}
