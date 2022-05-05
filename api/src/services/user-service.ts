import { ApiBuildSQLError, ApiExecuteSQLError } from '../errors/custom-error';
import { UserObject } from '../models/user';
import { queries } from '../queries/queries';
import { DBService } from './service';

export type ListSystemUsers = {
  id: number;
  user_identifier: string;
  record_end_date: string;
  role_ids: number[];
  role_names: string[];
};

export class UserService extends DBService {
  /**
   * Fetch a single system user by their ID.
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<UserObject | null>)}
   * @memberof UserService
   */
  async getUserById(systemUserId: number): Promise<UserObject | null> {
    const sqlStatement = queries.users.getUserByIdSQL(systemUserId);

    if (!sqlStatement) {
      throw new ApiBuildSQLError('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response?.rows?.[0] && new UserObject(response.rows[0])) || null;
  }

  /**
   * Get an existing system user.
   *
   * @param {string} userIdentifier
   * @return {*}  {(Promise<UserObject | null>)}
   * @memberof UserService
   */
  async getUserByIdentifier(userIdentifier: string): Promise<UserObject | null> {
    const sqlStatement = queries.users.getUserByUserIdentifierSQL(userIdentifier);

    if (!sqlStatement) {
      throw new ApiBuildSQLError('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    return (response?.rows?.[0] && new UserObject(response.rows[0])) || null;
  }

  /**
   * Adds a new system user.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async addSystemUser(userIdentifier: string, identitySource: string): Promise<UserObject> {
    const addSystemUserSQLStatement = queries.users.addSystemUserSQL(userIdentifier, identitySource);

    if (!addSystemUserSQLStatement) {
      throw new ApiBuildSQLError('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(addSystemUserSQLStatement.text, addSystemUserSQLStatement.values);

    const userObject = (response?.rows?.[0] && new UserObject(response.rows[0])) || null;

    if (!userObject) {
      throw new ApiExecuteSQLError('Failed to insert system user');
    }

    return userObject;
  }

  /**
   * Get a list of all system users.
   *
   * @return {*}  {Promise<UserObject[]>}
   * @memberof UserService
   */
  async listSystemUsers(): Promise<UserObject[]> {
    const getUserListSQLStatement = queries.users.getUserListSQL();

    if (!getUserListSQLStatement) {
      throw new ApiBuildSQLError('Failed to build SQL select statement');
    }

    const getUserListResponse = await this.connection.query(
      getUserListSQLStatement.text,
      getUserListSQLStatement.values
    );

    return getUserListResponse.rows.map((row) => new UserObject(row));
  }

  /**
   * Gets a system user, adding them if they do not already exist, or activating them if they had been deactivated (soft
   * deleted).
   *
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {IDBConnection} connection
   * @return {*}  {Promise<UserObject>}
   * @memberof UserService
   */
  async ensureSystemUser(userIdentifier: string, identitySource: string): Promise<UserObject> {
    // Check if the user exists in SIMS
    let userObject = await this.getUserByIdentifier(userIdentifier);

    if (!userObject) {
      // Id of the current authenticated user
      const systemUserId = this.connection.systemUserId();

      if (!systemUserId) {
        throw new ApiExecuteSQLError('Failed to identify system user ID');
      }

      // Found no existing user, add them
      userObject = await this.addSystemUser(userIdentifier, identitySource);
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

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete user system roles');
    }
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
