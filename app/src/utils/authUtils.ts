import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';

/**
 * Coerces a string into a user identity source, e.g. BCEID, IDIR, etc.
 *
 * @example coerceIdentitySource('idir'); // => SYSTEM_IDENTITY_SOURCE.IDIR
 *
 * @param userIdentitySource The user identity source string
 * @returns {*} {SYSTEM_IDENTITY_SOURCE | null}
 */
export const coerceIdentitySource = (userIdentitySource: string | undefined): SYSTEM_IDENTITY_SOURCE | null => {
  switch (userIdentitySource) {
    case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
      return SYSTEM_IDENTITY_SOURCE.BCEID_BASIC;

    case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
      return SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS;

    case SYSTEM_IDENTITY_SOURCE.IDIR:
      return SYSTEM_IDENTITY_SOURCE.IDIR;

    default:
      return null;
  }
};

/**
 * Compares an array of incoming values against an array of valid values.
 *
 * @param {(string | string[])} [validValues] valid values to match against
 * @param {(string | string[])} [incomingValues] incoming values to check against the valid values
 * @return {*} {boolean} true if the incomingValues has at least 1 of the validValues or no valid values are
 * specified, false otherwise
 */
export const hasAtLeastOneValidValue = function (
  validValues?: string | string[],
  incomingValues?: string | string[]
): boolean {
  if (!validValues?.length) {
    // No valid roles defined
    return true;
  }

  if (!incomingValues?.length) {
    // At least one valid role defined, but user has no roles
    return false;
  }

  if (!Array.isArray(validValues)) {
    validValues = [validValues];
  }

  if (!Array.isArray(incomingValues)) {
    incomingValues = [incomingValues];
  }

  for (const validRole of validValues) {
    if (incomingValues.includes(validRole)) {
      return true;
    }
  }

  return false;
};
