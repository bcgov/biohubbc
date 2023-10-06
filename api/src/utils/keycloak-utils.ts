import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';

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
  const userIdentitySource: string =
    keycloakToken?.['identity_provider'] || keycloakToken?.['preferred_username']?.split('@')?.[1];

  return coerceUserIdentitySource(userIdentitySource);
};

/**
 * Coerce the raw keycloak token identity provider value into an system identity source enum value.
 * If the given user identity source string does not satisfy one of `SYSTEM_IDENTITY_SOURCE`, the return
 * value defaults to `SYSTEM_IDENTITY_SOURCE.DATABASE`.
 *
 * @example coerceUserIdentitySource('idir') => 'idir' satisfies SYSTEM_IDENTITY_SOURCE.IDIR
 *
 * @param userIdentitySource the identity source string
 * @returns {*} {SYSTEM_IDENTITY_SOURCE} the identity source belonging to type SYSTEM_IDENTITY_SOURCE
 */
export const coerceUserIdentitySource = (userIdentitySource: string | null): SYSTEM_IDENTITY_SOURCE => {
  switch (userIdentitySource?.toUpperCase()) {
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
 * Parses out the `clientId` and `azp` fields from the token and maps them to a known `SOURCE_SYSTEM`, or null if no
 * match is found.
 *
 * @param {object} keycloakToken
 * @return {*}  {(SOURCE_SYSTEM | null)}
 */
export const getKeycloakSource = (keycloakToken: object): SOURCE_SYSTEM | null => {
  const clientId = keycloakToken?.['clientId']?.toUpperCase();

  const azp = keycloakToken?.['azp']?.toUpperCase();

  if (!clientId && !azp) {
    return null;
  }

  if ([clientId, azp].includes(SOURCE_SYSTEM['SIMS-SVC-4464'])) {
    return SOURCE_SYSTEM['SIMS-SVC-4464'];
  }

  return null;
};
