import { decode, verify } from 'jsonwebtoken';
import JwksRsa, { JwksClient } from 'jwks-rsa';
import { promisify } from 'util';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('security/auth-utils');

const KEYCLOAK_URL =
  process.env.KEYCLOAK_URL || 'https://dev.oidc.gov.bc.ca/auth/realms/35r1iman/protocol/openid-connect/certs';

// Ignore keycloak token expiration - for development purposes only
const TOKEN_IGNORE_EXPIRATION: boolean =
  process.env.TOKEN_IGNORE_EXPIRATION === 'true' || process.env.DB_HOST === 'localhost' || false;

/**
 * Authenticate the current user against the current route.
 *
 * @param {*} req
 * @param {*} authOrSecDef
 * @param {*} token
 * @param {*} callback
 * @returns {*}
 */
export const authenticate = async function (req: any, scopes: string[]): Promise<any> {
  try {
    defaultLog.debug({ label: 'authenticate', message: 'authenticating user', scopes });

    if (!req.headers || !req.headers.authorization) {
      defaultLog.warn({ label: 'authenticate', message: 'token was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    const token = req.headers.authorization;

    defaultLog.debug({ label: 'authenticate', message: 'authenticating user', token });

    if (token.indexOf('Bearer ') !== 0) {
      defaultLog.warn({ label: 'authenticate', message: 'token did not have a bearer' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    // Validate the 'Authorization' header.
    // Authorization header should be a string with format: Bearer xxxxxx.yyyyyyy.zzzzzz
    const tokenString = token.split(' ')[1];

    if (!tokenString) {
      defaultLog.warn({ label: 'authenticate', message: 'token string was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    // Decode token without verifying signature
    const decodedToken = decode(tokenString, { complete: true, json: true });

    if (!decodedToken) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    // Get token header kid
    const kid = decodedToken.header && decodedToken.header.kid;

    if (!decodedToken) {
      defaultLog.warn({ label: 'authenticate', message: 'decoded token header kid was null' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    const jwksClient: JwksClient = JwksRsa({ jwksUri: KEYCLOAK_URL });

    const getSigningKeyAsync = promisify(jwksClient.getSigningKey);

    // Get signing key from certificate issuer
    const key = await getSigningKeyAsync(kid);

    if (!key) {
      defaultLog.warn({ label: 'authenticate', message: 'get signing key' });
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    const signingKey = key['publicKey'] || key['rsaPublicKey'];

    // Verify token using signing key
    const verifiedToken = verifyToken(tokenString, signingKey);

    if (!verifiedToken) {
      throw {
        status: 401,
        message: 'Access Denied'
      };
    }

    // Add the verified token to the request for future use, if needed
    req.auth_payload = verifiedToken;

    return true;
  } catch (error) {
    defaultLog.warn({ label: 'authenticate', message: `unexpected error - ${error.message}`, error });
    throw {
      status: 401,
      message: 'Access Denied'
    };
  }
};

/**
 * Verify jwt token.
 *
 * @param {*} tokenString
 * @param {*} secretOrPublicKey
 * @returns {*} verifiedToken
 */
const verifyToken = function (tokenString: any, secretOrPublicKey: any): any {
  return verify(
    tokenString,
    secretOrPublicKey,
    { ignoreExpiration: TOKEN_IGNORE_EXPIRATION },
    function (verificationError: any, verifiedToken: any): any {
      if (verificationError) {
        defaultLog.warn({ label: 'verifyToken', message: 'jwt verification error', verificationError });
        return null;
      }

      defaultLog.debug({ label: 'verifyToken', message: 'verifiedToken', verifiedToken });

      // Verify that the token came from the expected issuer
      // Example: when running in prod, only accept tokens from `sso.pathfinder...` and not `sso-dev.pathfinder...`, etc
      if (!KEYCLOAK_URL.includes(verifiedToken.iss)) {
        defaultLog.warn({
          label: 'verifyToken',
          message: 'jwt verification error: issuer mismatch',
          'found token issuer': verifiedToken.iss,
          'expected to be a substring of': KEYCLOAK_URL
        });
        return null;
      }

      defaultLog.debug({ label: 'verifyToken', message: 'jwt verification success' });

      return verifiedToken;
    }
  );
};
