import { IDBConnection } from '../../database/db';
import { HTTP500 } from '../../errors/CustomError';
import { UserObject } from '../../models/user';
import { getUserByIdSQL } from '../../queries/users/user-queries';

// /**
//  * Fetch the current system user, based on `req.keycloak_token`.
//  *
//  * Assign the resulting user object to `req.system_user`.
//  *
//  * @export
//  * @return {*}  {RequestHandler}
//  */
// export function getSystemUser(): RequestHandler {
//   return async (req, res, next) => {
//     const connection = getDBConnection(req['keycloak_token']);

//     try {
//       await connection.open();

//       let userObject;

//       try {
//         userObject = await getSystemUserObject(connection);
//       } catch (error) {
//         defaultLog.warn({ label: 'getSystemUser', message: 'error', error });
//         throw new HTTP403('Access Denied');
//       }

//       req['system_user'] = userObject;

//       return next();
//     } catch (error) {
//       defaultLog.error({ label: 'getSystemUser', message: 'error', error });
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
//   };
// }

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
