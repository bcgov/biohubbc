import { decode, GetPublicKeyOrSecret, Secret, verify, VerifyErrors } from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';
import { promisify } from 'util';
import { getDBConnection } from '../database/db';
import { HTTP401, HTTP403 } from '../errors/CustomError';
import { UserObject } from '../models/user';
import { getUserByIdSQL } from '../queries/users/user-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('security/auth-utils');

const KEYCLOAK_URL =
  process.env.KEYCLOAK_URL || 'https://dev.oidc.gov.bc.ca/auth/realms/35r1iman/protocol/openid-connect/certs';

/**
 * Authenticate the request by validating the authorization bearer token.
 *
 * @param {*} req
 * @return {*} {Promise<true>} true if the token is authenticated
 * @throws {HTTP401} if the token is not authenticated
 */
export const authenticate = async function (req: any): Promise<true> {
  try {
    if (!req?.headers?.authorization) {
      defaultLog.warn({ label: 'authenticate', message: 'authorization headers were null or missing' });
      throw new HTTP401('Access Denied');
    }

    // Authorization header should be a string with format: Bearer xxxxxx.yyyyyyy.zzzzzz
    const authorizationHeaderString = req.headers.authorization;

    // Check if the header is a valid bearer format
    if (authorizationHeaderString.indexOf('Bearer ') !== 0) {
      defaultLog.warn({ label: 'authenticate', message: 'authorization header did not have a bearer' });
      throw new HTTP401('Access Denied');
    }

    // Parse out token portion of the authorization header
    const tokenString = authorizationHeaderString.split(' ')[1];

    if (!tokenString) {
      defaultLog.warn({ label: 'authenticate', message: 'token string was null' });
      throw new HTTP401('Access Denied');
    }

    // Decode token without verifying signature
    const decodedToken = decode(tokenString, { complete: true, json: true });

    if (!decodedToken) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token was null' });
      throw new HTTP401('Access Denied');
    }

    // Get token header kid (key id)
    const kid = decodedToken.header && decodedToken.header.kid;

    if (!kid) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token header kid was null' });
      throw new HTTP401('Access Denied');
    }

    const jwksClient: JwksClient = JwksRsa({ jwksUri: KEYCLOAK_URL });

    const getSigningKeyAsync = promisify(jwksClient.getSigningKey);

    // Get signing key from certificate issuer
    const key = await getSigningKeyAsync(kid);

    if (!key) {
      defaultLog.warn({ label: 'authenticate', message: 'signing key was null' });
      throw new HTTP401('Access Denied');
    }

    // Parse out public portion of signing key
    const signingKey = key['publicKey'] || key['rsaPublicKey'];

    // Verify token using public signing key
    const verifiedToken = verifyToken(tokenString, signingKey);

    if (!verifiedToken) {
      throw new HTTP401('Access Denied');
    }

    // Add the verified token to the request for future use, if needed
    req.keycloak_token = verifiedToken;

    return true;
  } catch (error) {
    defaultLog.warn({ label: 'authenticate', message: `unexpected error - ${error.message}`, error });
    throw new HTTP401('Access Denied');
  }
};

/**
 * Verify jwt token.
 *
 * @param {string} tokenString
 * @param {(Secret | GetPublicKeyOrSecret)} secretOrPublicKey
 * @return {*} The decoded token, or null.
 */
const verifyToken = function (tokenString: string, secretOrPublicKey: Secret | GetPublicKeyOrSecret): any {
  return verify(tokenString, secretOrPublicKey, verifyTokenCallback);
};

/**
 * Callback that returns the decoded token, or null.
 *
 * @param {(VerifyErrors | null)} verificationError
 * @param {(object | undefined)} verifiedToken
 * @return {*} {(object | null | undefined)}
 */
const verifyTokenCallback = function (
  verificationError: VerifyErrors | null,
  verifiedToken: object | undefined
): object | null | undefined {
  if (verificationError) {
    defaultLog.warn({ label: 'verifyToken', message: 'jwt verification error', verificationError });
    return null;
  }

  // Verify that the token came from the expected issuer
  // Example: when running in prod, only accept tokens from `sso.pathfinder...` and not `sso-dev.pathfinder...`, etc
  if (!KEYCLOAK_URL.includes(verifiedToken?.['iss'])) {
    defaultLog.warn({
      label: 'verifyToken',
      message: 'jwt verification error: issuer mismatch',
      'actual token issuer': verifiedToken?.['iss'],
      'expected to be a substring of': KEYCLOAK_URL
    });
    return null;
  }

  return verifiedToken;
};

/**
 * Authenticate the current user against the current route by validating their roles against the route scopes (roles).
 *
 * @param {*} req
 * @param {string[]} scopes identifiers (typically roles) that the user roles/rules/etc must be valid against
 * @returns {*} {Promise<true>} true if the user is authorized
 * @throws {HTTP403} if the user is not authorized
 */
export const authorize = async function (req: any, scopes: string[]): Promise<true> {
  if (!req?.keycloak_token) {
    defaultLog.warn({ label: 'authorize', message: 'request is missing a keycloak token' });
    throw new HTTP403('Access Denied');
  }

  if (!scopes || !scopes.length) {
    return true;
  }

  let systemUserWithRoles;

  try {
    systemUserWithRoles = await getSystemUser(req.keycloak_token);
  } catch {
    defaultLog.warn({ label: 'authorize', message: 'failed to get system user' });
    throw new HTTP403('Access Denied');
  }

  if (!systemUserWithRoles) {
    defaultLog.warn({ label: 'authorize', message: 'failed to get system user' });
    throw new HTTP403('Access Denied');
  }

  const userObject = new UserObject(systemUserWithRoles);

  const hasValidSystemRole = userHasValidSystemRoles(scopes, userObject.role_names);

  if (!hasValidSystemRole) {
    defaultLog.warn({ label: 'authorize', message: 'system user does not have any valid system roles' });
    throw new HTTP403('Access Denied');
  }

  return true;
};

/**
 * Finds a single user based on their keycloak token information.
 *
 * @param {object} keycloakToken
 * @return {*}
 */
export const getSystemUser = async function (keycloakToken: object) {
  const connection = getDBConnection(keycloakToken);

  try {
    await connection.open();

    const systemUserId = connection.systemUserId();

    if (!systemUserId) {
      return null;
    }

    const sqlStatement = getUserByIdSQL(systemUserId);

    if (!sqlStatement) {
      return null;
    }

    const response = await connection.query(sqlStatement.text, sqlStatement.values);

    await connection.commit();

    return (response && response.rowCount && response.rows[0]) || null;
  } catch (error) {
    defaultLog.debug({ label: 'getSystemUser', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Checks a set of user system roles against a set of valid system roles.
 *
 * @param {(string | string[])} validSystemRoles one or more valid roles to match against
 * @param {(string | string[])} userSystemRoles one or more user roles to check against the valid roles
 * @return {boolean} true if the user has at least 1 of the valid roles, false otherwise
 */
export const userHasValidSystemRoles = function (
  validSystemRoles: string | string[],
  userSystemRoles: string | string[]
): boolean {
  if (!validSystemRoles || !validSystemRoles.length) {
    return true;
  }

  if (!Array.isArray(validSystemRoles)) {
    validSystemRoles = [validSystemRoles];
  }

  if (!Array.isArray(userSystemRoles)) {
    userSystemRoles = [userSystemRoles];
  }

  for (const validRole of validSystemRoles) {
    if (userSystemRoles.includes(validRole)) {
      return true;
    }
  }

  return false;
};
