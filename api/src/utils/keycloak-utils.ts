import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';

/**
 * Parses out the preferred_username name from the token.
 *
 * @param {object} keycloakToken
 * @return {*} {(string | null)}
 */
export const getUserIdentifier = (keycloakToken: object): string | null => {
  const userIdentifier = keycloakToken?.['preferred_username']?.split('@')?.[0];

  if (!userIdentifier) {
    return null;
  }

  return userIdentifier;
};

/**
 * Parses out the preferred_username identity source (idir, bceid, etc) from the token.
 *
 * @param {object} keycloakToken
 * @return {*} {SYSTEM_IDENTITY_SOURCE}
 */
export const getUserIdentitySource = (keycloakToken: object): SYSTEM_IDENTITY_SOURCE => {
  const userIdentitySource = keycloakToken?.['preferred_username']?.split('@')?.[1];

  if (userIdentitySource?.toUpperCase() === SYSTEM_IDENTITY_SOURCE.BCEID) {
    return SYSTEM_IDENTITY_SOURCE.BCEID;
  }

  if (userIdentitySource?.toUpperCase() === SYSTEM_IDENTITY_SOURCE.IDIR) {
    return SYSTEM_IDENTITY_SOURCE.IDIR;
  }

  if (userIdentitySource?.toUpperCase() === SYSTEM_IDENTITY_SOURCE.DATABASE) {
    return SYSTEM_IDENTITY_SOURCE.DATABASE;
  }

  // Covers users created directly in keycloak, that wouldn't have identity source
  return SYSTEM_IDENTITY_SOURCE.DATABASE;
};
