import { IDBConnection } from '../../database/db';
import { HTTP500 } from '../../errors/CustomError';
import { UserObject } from '../../models/user';
import { getUserByIdSQL } from '../../queries/users/user-queries';

export const getSystemUserObject = async (connection: IDBConnection): Promise<UserObject> => {
  let systemUserWithRoles;

  try {
    systemUserWithRoles = await getSystemUserWithRoles(connection);
  } catch {
    throw new HTTP500('failed to get system user');
  }

  if (!systemUserWithRoles) {
    throw new HTTP500('system user was null');
  }

  return new UserObject(systemUserWithRoles);
};

/**
 * Finds a single user based on their keycloak token information.
 *
 * @param {IDBConnection} connection
 * @return {*}
 */
export const getSystemUserWithRoles = async (connection: IDBConnection) => {
  const systemUserId = connection.systemUserId();

  if (!systemUserId) {
    return null;
  }

  const sqlStatement = getUserByIdSQL(systemUserId);

  if (!sqlStatement) {
    return null;
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return (response && response.rowCount && response.rows[0]) || null;
};
