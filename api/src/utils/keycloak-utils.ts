import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { EXTERNAL_BCEID_IDENTITY_SOURCES, EXTERNAL_IDIR_IDENTITY_SOURCES } from '../constants/keycloak';

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
 * @return {*}  {(SYSTEM_IDENTITY_SOURCE | null)}
 */
export const getUserIdentitySource = (keycloakToken: object): SYSTEM_IDENTITY_SOURCE | null => {
  const userIdentitySource = keycloakToken?.['preferred_username']?.split('@')?.[1]?.toUpperCase();

  return convertUserIdentitySource(userIdentitySource);
};

/**
 * Converts an identity source string to a matching one supported by the database.
 *
 * Why? Some identity sources ave multiple variations of their source string, which the get translated to a single
 * variation so that the SIMS application doesn't have to account for every variation in its logic.
 *
 * @param {object} keycloakToken
 * @return {*}  {(SYSTEM_IDENTITY_SOURCE | null)}
 */
export const convertUserIdentitySource = (identitySource: string): SYSTEM_IDENTITY_SOURCE | null => {
  const uppercaseIdentitySource = identitySource?.toUpperCase();

  if (EXTERNAL_BCEID_IDENTITY_SOURCES.includes(uppercaseIdentitySource)) {
    return SYSTEM_IDENTITY_SOURCE.BCEID;
  }

  if (EXTERNAL_IDIR_IDENTITY_SOURCES.includes(uppercaseIdentitySource)) {
    return SYSTEM_IDENTITY_SOURCE.IDIR;
  }

  if (uppercaseIdentitySource === SYSTEM_IDENTITY_SOURCE.DATABASE) {
    return SYSTEM_IDENTITY_SOURCE.DATABASE;
  }

  return null;
};
