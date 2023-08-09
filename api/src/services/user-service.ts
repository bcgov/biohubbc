import { IDBConnection } from '../database/db';
import { ApiBuildSQLError, ApiExecuteSQLError } from '../errors/api-error';
import { User } from '../models/user';
import { queries } from '../queries/queries';
import { UserRepository } from '../repositories/user-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';

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
   * @return {*}  {(Promise<User>)}
   * @memberof UserService
   */
  async getUserById(systemUserId: number): Promise<User> {
    const response = await this.userRepository.getUserById(systemUserId);

    return response;
  }

  /**
   * Get an existing system user by their GUID.
   *
   * @param {string} userGuid The user's GUID
   * @return {*}  {(Promise<User | null>)}
   * @memberof UserService
   */
  async getUserByGuid(userGuid: string): Promise<User | null> {
    defaultLog.debug({ label: 'getUserByGuid', userGuid });

    const response = await this.userRepository.getUserByGuid(userGuid);

    if (response.length !== 1) {
      return null;
    }

    return response[0];
  }

  /**
   * Get an existing system user by their user identifier and identity source.
   *
   * @param userIdentifier the user's identifier
   * @param identitySource the user's identity source, e.g. `'IDIR'`
   * @return {*}  {(Promise<User | null>)} Promise resolving the User, or `null` if the user wasn't found.
   * @memberof UserService
   */
  async getUserByIdentifier(userIdentifier: string, identitySource: string): Promise<User | null> {
    defaultLog.debug({ label: 'getUserByIdentifier', userIdentifier, identitySource });

    const response = await this.userRepository.getUserByIdentifier(userIdentifier, identitySource);

    if (response.length !== 1) {
      return null;
    }

    return response[0];
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
   * @return {*}  {Promise<User>}
   * @memberof UserService
   */
  async addSystemUser(
    userGuid: string | null,
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string
  ): Promise<{ system_user_id: number }> {
    const response = await this.userRepository.addSystemUser(
      userGuid,
      userIdentifier,
      identitySource,
      displayName,
      email
    );

    return response;
  }

  /**
   * Get a list of all system users.
   *
   * @return {*}  {Promise<User[]>}
   * @memberof UserService
   */
  async listSystemUsers(): Promise<User[]> {
    const response = await this.userRepository.listSystemUsers();

    return response;
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
   * @return {*}  {Promise<User>}
   * @memberof UserService
   */
  async ensureSystemUser(
    userGuid: string | null,
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string
  ): Promise<User> {
    // Check if the user exists in SIMS
    const existingUser = userGuid
      ? await this.getUserByGuid(userGuid)
      : await this.getUserByIdentifier(userIdentifier, identitySource);

    if (!existingUser) {
      // Id of the current authenticated user
      const systemUserId = this.connection.systemUserId();

      if (!systemUserId) {
        throw new ApiExecuteSQLError('Failed to identify system user ID');
      }

      // Found no existing user, add them
      const newUserId = await this.addSystemUser(userGuid, userIdentifier, identitySource, displayName, email);

      // fetch the new user object
      return this.getUserById(newUserId.system_user_id);
    }

    if (!existingUser.record_end_date) {
      // system user is already active
      return existingUser;
    }

    // system user is not active, re-activate them
    await this.activateSystemUser(existingUser.system_user_id);

    // get the newly activated user
    return this.getUserById(existingUser.system_user_id);
  }

  /**
   * Activates an existing system user that had been deactivated (soft deleted).
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<User>)}
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
   * @return {*}  {(Promise<User>)}
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
