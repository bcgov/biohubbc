import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { EXTERNAL_BCEID_IDENTITY_SOURCES, EXTERNAL_IDIR_IDENTITY_SOURCES } from '../constants/keycloak';

/**
 * Parses out the user's GUID from a keycloak token, which is extracted from the
 * `preferred_username` property.
 *
 * @example getUserGuid({ preferred_username: 'aaabbaaa@idir' }) // => 'aaabbaaa'
 *
 * @param {object} keycloakToken
 * @return {*} {(string | null)}
 */
export const getUserGuid = (keycloakToken: object): string | null => {
  const userIdentifier = keycloakToken?.['preferred_username']?.split('@')?.[0];

  if (!userIdentifier) {
    return null;
  }

  return userIdentifier;
};

/**
 * Parses out the user's identifier from a keycloak token.
 *
 * @example getUserIdentifier({ ....token, bceid_username: 'jsmith@idir' }) => 'jsmith'
 *
 * @param {object} keycloakToken
 * @return {*} {(string | null)}
 */
export const getUserIdentifier = (keycloakToken: object): string | null => {
  const userIdentifier = keycloakToken?.['idir_username'] || keycloakToken?.['bceid_username'];

  if (!userIdentifier) {
    return null;
  }

  return userIdentifier;
};

/**
 * Parses out the preferred_username identity source ('idir', 'bceidbasic', etc.) from the token and maps it to a known
 * `SYSTEM_IDENTITY_SOURCE`. If the `identity_provider` field in the keycloak token object is undefined, then the
 * identity source is inferred from the `preferred_username` field as a contingency.
 *
 * @example getUserIdentitySource({ ...token, identity_provider: 'bceidbasic' }) => SYSTEM_IDENTITY_SOURCE.BCEID_BASIC
 * @example getUserIdentitySource({ preferred_username: 'aaaa@idir' }) => SYSTEM_IDENTITY_SOURCE.IDIR
 *
 * @param {object} keycloakToken
 * @return {*} {SYSTEM_IDENTITY_SOURCE}
 */
export const getUserIdentitySource = (keycloakToken: object): SYSTEM_IDENTITY_SOURCE => {
  const userIdentitySource: string = (
    keycloakToken?.['identity_provider'] || keycloakToken?.['preferred_username']?.split('@')?.[1]
  )?.toUpperCase();

  return coerceUserIdentitySource(userIdentitySource);
};

/**
 * @TODO jsdoc
 * Coerce the raw keycloak token identity provider value into an system identity source enum value
 * @param userIdentitySource
 * @returns
 */
export const coerceUserIdentitySource = (userIdentitySource: string): SYSTEM_IDENTITY_SOURCE => {
  switch (userIdentitySource) {
    case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
      return SYSTEM_IDENTITY_SOURCE.BCEID_BASIC;

    case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
      return SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS;

    case SYSTEM_IDENTITY_SOURCE.IDIR:
      return SYSTEM_IDENTITY_SOURCE.IDIR;

    case SYSTEM_IDENTITY_SOURCE.SYSTEM:
      return SYSTEM_IDENTITY_SOURCE.SYSTEM;

    case SYSTEM_IDENTITY_SOURCE.DATABASE:
      return SYSTEM_IDENTITY_SOURCE.DATABASE;

    default:
      // Covers a user created directly in keycloak which wouldn't have an identity source
      return SYSTEM_IDENTITY_SOURCE.DATABASE;
  }
};

/**
 * Converts an identity source string to a matching one supported by the database.
 *
 * Why? Some identity sources ave multiple variations of their source string, which the get translated to a single
 * variation so that the SIMS application doesn't have to account for every variation in its logic.
 *
 * @param {object} keycloakToken
 * @deprecated Replaced by coerceUserIdentitySource
 * @return {*}  {(SYSTEM_IDENTITY_SOURCE | null)}
 */
export const _convertUserIdentitySource = (identitySource: string): SYSTEM_IDENTITY_SOURCE | null => {
  const uppercaseIdentitySource = identitySource?.toUpperCase();

  if (EXTERNAL_BCEID_IDENTITY_SOURCES.includes(uppercaseIdentitySource)) {
    return SYSTEM_IDENTITY_SOURCE.BCEID_BASIC;
  }

  if (EXTERNAL_IDIR_IDENTITY_SOURCES.includes(uppercaseIdentitySource)) {
    return SYSTEM_IDENTITY_SOURCE.IDIR;
  }

  if (uppercaseIdentitySource === SYSTEM_IDENTITY_SOURCE.DATABASE) {
    return SYSTEM_IDENTITY_SOURCE.DATABASE;
  }

  return null;
};
