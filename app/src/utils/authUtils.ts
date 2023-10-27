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
