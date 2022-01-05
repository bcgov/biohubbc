import { IDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/custom-error';
import { UserObject } from '../models/user';
import { queries } from '../queries/queries';

/**
 * Gets a system user, adding them if they do not already exist, or activating them if they had been deactivated (soft
 * deleted).
 *
 * @param {string} userIdentifier
 * @param {string} identitySource
 * @param {IDBConnection} connection
 * @return {*}  {Promise<UserObject>}
 */
export const ensureSystemUser = async (
  userIdentifier: string,
  identitySource: string,
  connection: IDBConnection
): Promise<UserObject> => {
  // Check if the user exists in SIMS
  let systemUserRecord = await getSystemUser(userIdentifier, connection);

  if (!systemUserRecord) {
    // Id of the current authenticated user
    const systemUserId = connection.systemUserId();

    if (!systemUserId) {
      throw new HTTP400('Failed to identify system user ID');
    }

    // Found no existing user, add them
    systemUserRecord = await addSystemUser(userIdentifier, identitySource, connection);
  }

  const userObject = new UserObject(systemUserRecord);

  if (!userObject.user_record_end_date) {
    // system user is active
    return userObject;
  }

  // system user is not active, re-activate them
  const response = await activateDeactivatedSystemUser(userObject.id, connection);

  if (!response) {
    throw new HTTP500('Failed to activate system user');
  }

  return new UserObject(response);
};

/**
 * Get an existing system user.
 *
 * @param {string} userIdentifier
 * @param {IDBConnection} connection
 * @return {*}  {(Promise<UserObject | null>)}
 */
export const getSystemUser = async (userIdentifier: string, connection: IDBConnection): Promise<UserObject | null> => {
  const sqlStatement = queries.users.getUserByUserIdentifierSQL(userIdentifier);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP400('Failed to get system user');
  }

  return response?.rows?.[0] || null;
};

/**
 * Adds a new system user.
 *
 * Note: Will fail if the system user already exists.
 *
 * @param {string} userIdentifier
 * @param {string} identitySource
 * @param {IDBConnection} connection
 */
export const addSystemUser = async (userIdentifier: string, identitySource: string, connection: IDBConnection) => {
  const addSystemUserSQLStatement = queries.users.addSystemUserSQL(userIdentifier, identitySource);

  if (!addSystemUserSQLStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(addSystemUserSQLStatement.text, addSystemUserSQLStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new HTTP500('Failed to insert system user');
  }

  return result;
};

/**
 * Activates an existing system user that had been deactivated (soft deleted).
 *
 * @param {number} systemUserId
 * @param {IDBConnection} connection
 * @return {*}  {Promise<any>}
 */
export const activateDeactivatedSystemUser = async (systemUserId: number, connection: IDBConnection): Promise<any> => {
  const sqlStatement = queries.users.activateSystemUserSQL(systemUserId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to activate system user');
  }

  return response?.rows?.[0] || null;
};
