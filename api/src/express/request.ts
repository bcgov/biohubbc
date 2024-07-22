import { Request } from 'express';
import { SystemUser } from '../repositories/user-repository';
import { AuthorizationScheme } from '../services/authorization-service';
import { KeycloakUserInformation } from '../utils/keycloak-utils';

/**
 * Extending express request type.
 *
 * Additional properties are populated during different stages of .
 *
 */
declare module 'express-serve-static-core' {
  interface Request {
    /**
     * Keycloak user JWT token.
     *
     * @see authentication.ts -> authenticateRequest()
     *
     */
    keycloak_token?: KeycloakUserInformation;
    /**
     * SIMS system user details.
     *
     * @see authorization.ts -> authorizeRequest()
     *
     */
    system_user?: SystemUser;
    /**
     * Authorization Scheme object.
     *
     * @see authorization.ts -> authorizeRequestHandler()
     *
     */
    authorization_scheme?: AuthorizationScheme;
  }
}

/**
 * Get keycloak token from request or throw error.
 *
 * Value is defined for endpoints that specify `Bearer` security with correct JWT token.
 *
 * @see authentication.ts -> authenticateRequest()
 *
 * @param {Request} req - Express Request
 * @throws {Error} - Missing keycloak token
 * @returns {KeycloakUserInformation}
 */
export const getKeycloakTokenFromRequest = (req: Request): KeycloakUserInformation => {
  if (!req.keycloak_token) {
    throw new Error('Request missing keycloak token. Must be authenticated.');
  }
  return req.keycloak_token;
};

/**
 * Get system user from request of throw error.
 *
 * Value is defined for endpoints that authorize a user successfully against `AuthorizationScheme`.
 *
 * @see authorization.ts -> authorizeRequest()
 *
 * @param {Request} req - Express Request
 * @throws {Error} - Missing system user
 * @returns {SystemUser}
 */
export const getSystemUserFromRequest = (req: Request): SystemUser => {
  if (!req.system_user) {
    throw new Error('Request missing system user. Must be authorized.');
  }

  return req.system_user;
};
