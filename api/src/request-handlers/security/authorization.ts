import { Request } from 'express';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { ProjectUserObject, UserObject } from '../../models/user';
import { getLogger } from '../../utils/logger';
import { getProjectUserObject } from '../user/project-user';
import { getSystemUserObject } from '../user/system-user';

const defaultLog = getLogger('request-handlers/security/authorization');

enum AuthorizeOperator {
  AND = 'and',
  OR = 'or'
}

interface AuthorizeBySystemRoles {
  validSystemRoles: SYSTEM_ROLE[];
  discriminator: 'SystemRole';
}

interface AuthorizeByProjectRoles {
  validProjectRoles: PROJECT_ROLE[];
  projectId: number;
  discriminator: 'ProjectRole';
}

type AuthorizeRule = AuthorizeBySystemRoles | AuthorizeByProjectRoles;

type AuthorizeConfigOr = {
  [AuthorizeOperator.AND]?: never;
  [AuthorizeOperator.OR]: AuthorizeRule[];
};

type AuthorizeConfigAnd = {
  [AuthorizeOperator.AND]: AuthorizeRule[];
  [AuthorizeOperator.OR]?: never;
};

export type AuthorizationScheme = AuthorizeConfigAnd | AuthorizeConfigOr;

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
    await connection.open();

    let systemUserObject: UserObject = req['system_user'] || (await getSystemUserObject(connection));

    req['system_user'] = systemUserObject;

    if (!systemUserObject) {
      return false;
    }

    if (authorizeSystemAdministrator(systemUserObject)) {
      // User is a system administrator with full access, skip all remaining checks
      return true;
    }

    const authorizationScheme: AuthorizationScheme = req['authorization_scheme'];
    if (!authorizationScheme) {
      // No authorization scheme specified, all authenticated users are authorized
      return true;
    }

    return await executeAuthorizationScheme(req, systemUserObject, authorizationScheme, connection);
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
 * @param {UserObject} systemUserObject
 * @param {AuthorizationScheme} authorizationScheme
 * @param {IDBConnection} connection
 * @return {*}  {Promise<boolean>} `true` if the `authorizationScheme` indicates the user has access, `false` otherwise.
 */
export const executeAuthorizationScheme = async (
  req: Request,
  systemUserObject: UserObject,
  authorizationScheme: AuthorizationScheme,
  connection: IDBConnection
): Promise<boolean> => {
  if (authorizationScheme.and) {
    return (await executeAuthorizeConfig(req, systemUserObject, authorizationScheme.and, connection)).every(
      (item) => item
    );
  } else {
    return (await executeAuthorizeConfig(req, systemUserObject, authorizationScheme.or, connection)).some(
      (item) => item
    );
  }
};

/**
 * Execute an array of `AuthorizeRule`, returning an array of boolean results.
 *
 * @param {UserObject} systemUserObject
 * @param {AuthorizeRule[]} authorizeConfig
 * @param {IDBConnection} connection
 * @return {*}  {Promise<boolean[]>}
 */
export const executeAuthorizeConfig = async (
  req: Request,
  systemUserObject: UserObject,
  authorizeConfig: AuthorizeRule[],
  connection: IDBConnection
): Promise<boolean[]> => {
  const authorizeResults: boolean[] = [];

  for (const authorizeConfigItem of authorizeConfig) {
    switch (authorizeConfigItem.discriminator) {
      case 'SystemRole':
        authorizeResults.push(authorizeBySystemRole(systemUserObject, authorizeConfigItem));
        break;
      case 'ProjectRole':
        authorizeResults.push(await authorizeByProjectRole(req, authorizeConfigItem, connection));
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
export const authorizeSystemAdministrator = (systemUserObject: UserObject): boolean => {
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
export const authorizeBySystemRole = (
  systemUserObject: UserObject,
  authorizeSystemRoles: AuthorizeBySystemRoles
): boolean => {
  if (!systemUserObject) {
    // Cannot verify user roles
    return false;
  }

  if (!authorizeSystemRoles || !authorizeSystemRoles.validSystemRoles.length) {
    // No valid roles specified
    return true;
  }

  // Check if the user has at least 1 of the valid roles
  return userHasValidRole(authorizeSystemRoles.validSystemRoles, systemUserObject?.role_names);
};

/**
 * Check that the user has at least on of the valid project roles specified in `authorizeProjectRoles.validProjectRoles`.
 *
 * @param {UserObject} systemUserObject
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
  if (!authorizeProjectRoles.projectId) {
    // No project id to verify roles for
    return false;
  }

  if (!authorizeProjectRoles || !authorizeProjectRoles.validProjectRoles.length) {
    // No valid rules specified
    return true;
  }

  const projectUserObject: ProjectUserObject =
    req['project_user'] || (await getProjectUserObject(authorizeProjectRoles.projectId, connection));

  req['project_user'] = projectUserObject;

  if (!projectUserObject) {
    defaultLog.warn({ label: 'getProjectUser', message: 'project user was null' });
    return false;
  }

  return userHasValidRole(authorizeProjectRoles.validProjectRoles, projectUserObject.project_role_names);
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
