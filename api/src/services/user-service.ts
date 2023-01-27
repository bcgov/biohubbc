import { IDBConnection } from '../database/db';
import { ApiBuildSQLError, ApiExecuteSQLError } from '../errors/api-error';
import { UserObject } from '../models/user';
import { queries } from '../queries/queries';
import { UserRepository } from '../repositories/user-repository';
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
   * Adds a new system user.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async addSystemUser(userGuid: string | null, userIdentifier: string, identitySource: string): Promise<UserObject> {
    const response = await this.userRepository.addSystemUser(userGuid, userIdentifier, identitySource);

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
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async ensureSystemUser(userGuid: string | null, userIdentifier: string, identitySource: string): Promise<UserObject> {
    // Check if the user exists in SIMS
    let userObject = userGuid && await this.getUserByGuid(userGuid);

    if (!userObject) {
      // Id of the current authenticated user
      const systemUserId = this.connection.systemUserId();

      if (!systemUserId) {
        throw new ApiExecuteSQLError('Failed to identify system user ID');
      }

      // Found no existing user, add them
      userObject = await this.addSystemUser(userGuid, userIdentifier, identitySource);
    }

    if (!userObject.record_end_date) {
      // system user is already active
      return userObject;
    }

    // system user is not active, re-activate them
    await this.activateSystemUser(userObject.id);

    // get the newly activated user
    userObject = await this.getUserById(userObject.id);

    if (!userObject) {
      throw new ApiExecuteSQLError('Failed to ensure system user');
    }

    return userObject;
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
}
