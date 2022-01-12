import { Request } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP403, HTTP500 } from '../../errors/custom-error';
import { ProjectUserObject, UserObject } from '../../models/user';
import { queries } from '../../queries/queries';
import { UserService } from '../../services/user-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('request-handlers/security/authorization');

export enum AuthorizeOperator {
  AND = 'and',
  OR = 'or'
}

export interface AuthorizeBySystemRoles {
  validSystemRoles: SYSTEM_ROLE[];
  discriminator: 'SystemRole';
}

export interface AuthorizeByProjectRoles {
  validProjectRoles: PROJECT_ROLE[];
  projectId: number;
  discriminator: 'ProjectRole';
}

export interface AuthorizeBySystemUser {
  discriminator: 'SystemUser';
}

export type AuthorizeRule = AuthorizeBySystemRoles | AuthorizeByProjectRoles | AuthorizeBySystemUser;

export type AuthorizeConfigOr = {
  [AuthorizeOperator.AND]?: never;
  [AuthorizeOperator.OR]: AuthorizeRule[];
};

export type AuthorizeConfigAnd = {
  [AuthorizeOperator.AND]: AuthorizeRule[];
  [AuthorizeOperator.OR]?: never;
};

export type AuthorizationScheme = AuthorizeConfigAnd | AuthorizeConfigOr;

export type AuthorizationSchemeCallback = (req: Request) => AuthorizationScheme;

/**
 * Authorize a user against the `AuthorizationScheme` returned by `authorizationSchemeCallback`.
 *
 * Calls `next()` if the user is authorized.
 *
 * @export
 * @param {AuthorizationSchemeCallback} authorizationSchemeCallback
 * @throws {HTTP403} Access Denied if the user is not authorized.
 * @return {*}  {RequestHandler}
 */
export function authorizeRequestHandler(authorizationSchemeCallback: AuthorizationSchemeCallback): RequestHandler {
  return async (req, res, next) => {
    req['authorization_scheme'] = authorizationSchemeCallback(req);

    const isAuthorized = await authorizeRequest(req);

    if (!isAuthorized) {
      defaultLog.warn({ label: 'authorize', message: 'User is not authorized' });
      throw new HTTP403('Access Denied');
    }

    // User is authorized
    next();
  };
}

/**
 * Returns `true` if the user is authorized successfully against the `AuthorizationScheme` in
 * `req['authorization_scheme']`, `false` otherwise.
 *
 * Note: System administrators are automatically granted access, regardless of the authorization scheme provided.
 *
 * @param {Request} req
 * @return {*}  {Promise<boolean>}
 */
export const authorizeRequest = async (req: Request): Promise<boolean> => {
  const connection = getDBConnection(req['keycloak_token']);

  try {
    const authorizationScheme: AuthorizationScheme = req['authorization_scheme'];

    if (!authorizationScheme) {
      // No authorization scheme specified, all authenticated users are authorized
      return true;
    }

    await connection.open();

    const isAuthorized =
      (await authorizeSystemAdministrator(req, connection)) ||
      (await executeAuthorizationScheme(req, authorizationScheme, connection));

    await connection.commit();

    return isAuthorized;
  } catch (error) {
    defaultLog.error({ label: 'authorize', message: 'error', error });
    await connection.rollback();
    return false;
  } finally {
    connection.release();
  }
};

/**
 * Execute the `authorizationScheme` against the current user, and return `true` if they have access, `false` otherwise.
 *
 * @param {Request} req
 * @param {UserObject} systemUserObject
 * @param {AuthorizationScheme} authorizationScheme
 * @param {IDBConnection} connection
 * @return {*}  {Promise<boolean>} `true` if the `authorizationScheme` indicates the user has access, `false` otherwise.
 */
export const executeAuthorizationScheme = async (
  req: Request,
  authorizationScheme: AuthorizationScheme,
  connection: IDBConnection
): Promise<boolean> => {
  if (authorizationScheme.and) {
    return (await executeAuthorizeConfig(req, authorizationScheme.and, connection)).every((item) => item);
  } else {
    return (await executeAuthorizeConfig(req, authorizationScheme.or, connection)).some((item) => item);
  }
};

/**
 * Execute an array of `AuthorizeRule`, returning an array of boolean results.
 *
 * @param {Request} req
 * @param {AuthorizeRule[]} authorizeRules
 * @param {IDBConnection} connection
 * @return {*}  {Promise<boolean[]>}
 */
export const executeAuthorizeConfig = async (
  req: Request,
  authorizeRules: AuthorizeRule[],
  connection: IDBConnection
): Promise<boolean[]> => {
  const authorizeResults: boolean[] = [];

  for (const authorizeRule of authorizeRules) {
    switch (authorizeRule.discriminator) {
      case 'SystemRole':
        authorizeResults.push(await authorizeBySystemRole(req, authorizeRule, connection));
        break;
      case 'ProjectRole':
        authorizeResults.push(await authorizeByProjectRole(req, authorizeRule, connection));
        break;
      case 'SystemUser':
        authorizeResults.push(await authorizeBySystemUser(req, connection));
        break;
    }
  }

  return authorizeResults;
};

/**
 * Check if the user has the system administrator role.
 *
 * @param {UserObject} systemUserObject
 * @return {*}  {boolean} `true` if the user is a system administrator, `false` otherwise.
 */
export const authorizeSystemAdministrator = async (req: Request, connection: IDBConnection): Promise<boolean> => {
  const systemUserObject: UserObject = req['system_user'] || (await getSystemUserObject(connection));

  // Add the system_user to the request for future use, if needed
  req['system_user'] = systemUserObject;

  if (!systemUserObject) {
    // Cannot verify user roles
    return false;
  }

  return systemUserObject.role_names.includes(SYSTEM_ROLE.SYSTEM_ADMIN);
};

/**
 * Check that the user has at least one of the valid system roles specified in `authorizeSystemRoles.validSystemRoles`.
 *
 * @param {UserObject} systemUserObject
 * @param {AuthorizeBySystemRoles} authorizeSystemRoles
 * @return {*}  {boolean} `true` if the user has at least one valid system role role, or no valid system roles are
 * specified; `false` otherwise.
 */
export const authorizeBySystemRole = async (
  req: Request,
  authorizeSystemRoles: AuthorizeBySystemRoles,
  connection: IDBConnection
): Promise<boolean> => {
  if (!authorizeSystemRoles) {
    // Cannot verify user roles
    return false;
  }

  const systemUserObject: UserObject = req['system_user'] || (await getSystemUserObject(connection));

  // Add the system_user to the request for future use, if needed
  req['system_user'] = systemUserObject;

  if (!systemUserObject) {
    // Cannot verify user roles
    return false;
  }

  if (systemUserObject.record_end_date) {
    //system user has an expired record
    return false;
  }

  // Check if the user has at least 1 of the valid roles
  return userHasValidRole(authorizeSystemRoles.validSystemRoles, systemUserObject?.role_names);
};

/**
 * Check that the user has at least on of the valid project roles specified in `authorizeProjectRoles.validProjectRoles`.
 *
 * @param {Request} req
 * @param {AuthorizeByProjectRoles} authorizeProjectRoles
 * @param {IDBConnection} connection
 * @return {*}  {Promise<boolean>} `Promise<true>` if the user has at least one valid project role, or no valid project
 * roles are specified; `Promise<false>` otherwise.
 */
export const authorizeByProjectRole = async (
  req: Request,
  authorizeProjectRoles: AuthorizeByProjectRoles,
  connection: IDBConnection
): Promise<boolean> => {
  if (!authorizeProjectRoles || !authorizeProjectRoles.projectId) {
    // No project id to verify roles for
    return false;
  }

  if (!authorizeProjectRoles?.validProjectRoles.length) {
    // No valid rules specified
    return true;
  }

  const projectUserObject: ProjectUserObject =
    req['project_user'] || (await getProjectUserObject(authorizeProjectRoles.projectId, connection));

  // Add the project_user to the request for future use, if needed
  req['project_user'] = projectUserObject;

  if (!projectUserObject) {
    defaultLog.warn({ label: 'getProjectUser', message: 'project user was null' });
    return false;
  }

  return userHasValidRole(authorizeProjectRoles.validProjectRoles, projectUserObject.project_role_names);
};

/**
 * Check if the user is a valid system user.
 *
 * @param {Request} req
 * @param {IDBConnection} connection
 * @return {*}  {Promise<boolean>} `Promise<true>` if the user is a valid system user, `Promise<false>` otherwise.
 */
export const authorizeBySystemUser = async (req: Request, connection: IDBConnection): Promise<boolean> => {
  const systemUserObject: UserObject = req['system_user'] || (await getSystemUserObject(connection));

  // Add the system_user to the request for future use, if needed
  req['system_user'] = systemUserObject;

  if (!systemUserObject) {
    // Cannot verify user roles
    return false;
  }

  // User is a valid system user
  return true;
};

/**
 * Compares an array of user roles against an array of valid roles.
 *
 * @param {(string | string[])} validRoles valid roles to match against
 * @param {(string | string[])} userRoles user roles to check against the valid roles
 * @return {*} {boolean} true if the user has at least 1 of the valid roles or no valid roles are specified, false
 * otherwise
 */
export const userHasValidRole = function (validRoles: string | string[], userRoles: string | string[]): boolean {
  if (!validRoles || !validRoles.length) {
    return true;
  }

  if (!Array.isArray(validRoles)) {
    validRoles = [validRoles];
  }

  if (!Array.isArray(userRoles)) {
    userRoles = [userRoles];
  }

  for (const validRole of validRoles) {
    if (userRoles.includes(validRole)) {
      return true;
    }
  }

  return false;
};

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

  return systemUserWithRoles;
};

/**
 * Finds a single user based on their keycloak token information.
 *
 * @param {IDBConnection} connection
 * @return {*}  {(Promise<UserObject | null>)}
 * @return {*}
 */
export const getSystemUserWithRoles = async (connection: IDBConnection): Promise<UserObject | null> => {
  const systemUserId = connection.systemUserId();

  if (!systemUserId) {
    return null;
  }

  const userService = new UserService(connection);

  return userService.getUserById(systemUserId);
};

export const getProjectUserObject = async (
  projectId: number,
  connection: IDBConnection
): Promise<ProjectUserObject> => {
  let projectUserWithRoles;

  try {
    projectUserWithRoles = await getProjectUserWithRoles(projectId, connection);
  } catch {
    throw new HTTP500('failed to get project user');
  }

  if (!projectUserWithRoles) {
    throw new HTTP500('project user was null');
  }

  return new ProjectUserObject(projectUserWithRoles);
};

/**
 * Get a user's project roles, for a single project.
 *
 * @param {number} projectId
 * @param {IDBConnection} connection
 * @return {*}  {Promise<string[]>}
 */
export const getProjectUserWithRoles = async function (projectId: number, connection: IDBConnection): Promise<any> {
  const systemUserId = connection.systemUserId();

  if (!systemUserId || !projectId) {
    return null;
  }

  const sqlStatement = queries.projectParticipation.getProjectParticipationBySystemUserSQL(projectId, systemUserId);

  if (!sqlStatement) {
    return null;
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return response.rows[0] || null;
};
