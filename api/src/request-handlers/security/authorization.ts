import { Request, RequestHandler } from 'express';
import { getAPIUserDBConnection } from '../../database/db';
import { HTTP403 } from '../../errors/http-error';
import { AuthorizationScheme, AuthorizationService } from '../../services/authorization-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('request-handlers/security/authorization');

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
  return async (req, _, next) => {
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
  const connection = getAPIUserDBConnection();

  try {
    const authorizationScheme: AuthorizationScheme = req['authorization_scheme'];

    if (!authorizationScheme) {
      // No authorization scheme specified, all authenticated users are authorized
      return true;
    }

    await connection.open();

    const authorizationService = new AuthorizationService(connection, {
      systemUser: req.system_user,
      keycloakToken: req.keycloak_token
    });

    const isAuthorized =
      (await authorizationService.authorizeSystemAdministrator()) ||
      (await authorizationService.executeAuthorizationScheme(authorizationScheme));

    // Add the system_user to the request for future use, if needed
    req.system_user = authorizationService._systemUser;

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
