import { Request } from 'express';
import { SystemUserWithRoles } from '../models/system-user-view';
import { KeycloakUserInformation } from './keycloak-utils';

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
 * @returns {SystemUserWithRoles}
 */
export const getSystemUserFromRequest = (req: Request): SystemUserWithRoles => {
  if (!req.system_user) {
    throw new Error('Request missing system user. Must be authorized.');
  }

  return req.system_user;
};

/**
 * Get a query parameter from the request as an array of strings.
 *
 * Express parses a query parameter that appears once as a string and one that appears more than
 * once as an array, so a parameter the OpenAPI spec declares as an array arrives as either. A
 * caller that indexes or iterates the raw value walks the characters of the string form, so
 * callers that treat the parameter as a list must normalize it first. Values that are neither a
 * string nor an array of strings, which a nested query parameter such as `?name[key]=value`
 * produces, are dropped.
 *
 * @param {Request} req - Express Request
 * @param {string} name - Name of the query parameter
 * @returns {string[]} The query parameter values, empty if the parameter is absent
 */
export const getQueryParamArrayFromRequest = (req: Request, name: string): string[] => {
  const value = req.query?.[name];

  if (value === undefined) {
    return [];
  }

  return (Array.isArray(value) ? value : [value]).filter((item): item is string => typeof item === 'string');
};

/**
 * Get file by index from request or throws error if missing. Defaults to first file.
 *
 * @see schemas/file.ts
 *
 * @param {Request} req - Express Request
 * @param {number} [fileIndex] - Index of file (defaults to 0)
 * @throws {Error} - If unable to retrieve file
 * @returns {Express.Multer.File}
 */
export const getFileFromRequest = (req: Request, fileIndex = 0): Express.Multer.File => {
  if (!req.files || !req.files[fileIndex]) {
    throw new Error(`Request missing file. Unable to retrieve file at index ${fileIndex}.`);
  }

  return req.files[fileIndex];
};
