import { Request } from 'express';
import { SystemUser } from '../repositories/user-repository';
import { KeycloakUserInformation } from '../utils/keycloak-utils';

/**
 * Extending express request type.
 *
 */
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Keycloak user JWT token.
     *
     */
    keycloak_token?: KeycloakUserInformation;
    /**
     * SIMS system user details.
     *
     */
    system_user?: SystemUser;
  }
}

/**
 * Get keycloak token from request or throw error.
 *
 * Value is defined for endpoints that specify `Bearer` security with correct JWT token.
 *
 * @see authentication.ts -> authenticateRequest()
 *
 * @param {Request} req
 * @throws {Error} - Missing keycloak token
 * @returns {KeycloakUserInformation}
 */
export const getKeycloakTokenFromRequest = (req: Request): KeycloakUserInformation => {
  if (!req.keycloak_token) {
    throw new Error('Request missing keycloak token.');
  }
  return req.keycloak_token;
};

/**
 * Get system user from request of throw error.
 *
 * @see authorization.ts -> authorizeRequest()
 *
 * @param {Request} req
 * @throws {Error} - Missing system user
 * @returns {SystemUser}
 */
export const getSystemUserFromRequest = (req: Request): SystemUser => {
  if (!req.system_user) {
    throw new Error('Request missing system user.');
  }

  return req.system_user;
};
