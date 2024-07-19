import { Request } from 'express';
import { SystemUser } from '../repositories/user-repository';
import { KeycloakUserInformation } from './keycloak-utils';

/**
 * Get keycloak token from request or throw error.
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
