import { z } from 'zod';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';

/**
 * User information from a verified IDIR Keycloak token.
 */
export const IdirUserInformation = z.object({
  idir_user_guid: z.string().toLowerCase(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.IDIR.toLowerCase()),
  idir_username: z.string(),
  email_verified: z.boolean(),
  name: z.string(),
  preferred_username: z.string(),
  display_name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string()
});
export type IdirUserInformation = z.infer<typeof IdirUserInformation>;

/**
 * User information from a verified BCeID Basic Keycloak token.
 */
export const BceidBasicUserInformation = z.object({
  bceid_user_guid: z.string().toLowerCase(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.BCEID_BASIC.toLowerCase()),
  bceid_username: z.string().toLowerCase(),
  email_verified: z.boolean(),
  name: z.string(),
  preferred_username: z.string(),
  display_name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string()
});
export type BceidBasicUserInformation = z.infer<typeof BceidBasicUserInformation>;

/**
 * User information from a verified BCeID Keycloak token.
 */
export const BceidBusinessUserInformation = z.object({
  bceid_business_guid: z.string().toLowerCase(),
  bceid_business_name: z.string(),
  bceid_user_guid: z.string().toLowerCase(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS.toLowerCase()),
  bceid_username: z.string().toLowerCase(),
  email_verified: z.boolean(),
  name: z.string(),
  preferred_username: z.string(),
  display_name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string()
});
export type BceidBusinessUserInformation = z.infer<typeof BceidBusinessUserInformation>;

/**
 * User information from a verified BCeID Keycloak token.
 */
export const DatabaseUserInformation = z.object({
  database_user_guid: z.string(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.DATABASE.toLowerCase()),
  username: z.string()
});
export type DatabaseUserInformation = z.infer<typeof DatabaseUserInformation>;

/**
 * User information from either an IDIR or BCeID Keycloak token.
 */
export const VerifiedUserInformation = z.discriminatedUnion('identity_provider', [
  IdirUserInformation,
  BceidBasicUserInformation,
  BceidBusinessUserInformation,
  DatabaseUserInformation
]);
export type VerifiedUserInformation = z.infer<typeof VerifiedUserInformation>;

/**
 * User information from a manually entered unverified source (neither a verified IDIR or BCeID Keycloak token).
 */
export const UnverifiedUserInformation = z.object({
  username: z.string().optional().nullable(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.UNVERIFIED.toLowerCase()),
  display_name: z.string(),
  given_name: z.string(),
  family_name: z.string().optional().nullable(),
  email: z.string(),
  agency: z.string().optional().nullable()
});
export type UnverifiedUserInformation = z.infer<typeof UnverifiedUserInformation>;

/**
 * User information from either a verified IDIR or BCeID Keycloak token, or a manually entered unverified source.
 */
export const UserInformation = z.union([
  IdirUserInformation,
  BceidBasicUserInformation,
  BceidBusinessUserInformation,
  UnverifiedUserInformation
]);
export type UserInformation = z.infer<typeof UserInformation>;

/**
 * Returns the user information guid.
 *
 * @param {VerifiedUserInformation} verifiedUserInformation
 * @return {*}  {(string | null)}
 */
export const getUserGuid = (verifiedUserInformation: VerifiedUserInformation): string => {
  if (isIdirUserInformation(verifiedUserInformation)) {
    return verifiedUserInformation.idir_user_guid.toLowerCase();
  }

  if (isBceidBusinessUserInformation(verifiedUserInformation) || isBceidBasicUserInformation(verifiedUserInformation)) {
    return verifiedUserInformation.bceid_user_guid.toLowerCase();
  }

  return verifiedUserInformation.database_user_guid;
};

/**
 * Returns the user information identity source ('idir', 'bceidbasic', 'database, etc) and maps it to a known
 * `SYSTEM_IDENTITY_SOURCE`.
 *
 * @example getUserIdentitySource({ identity_provider: 'idir' }) => SYSTEM_IDENTITY_SOURCE.IDIR
 *
 * @param {Record<string, any>} keycloakToken
 * @return {*} {SYSTEM_IDENTITY_SOURCE} the identity source belonging to type SYSTEM_IDENTITY_SOURCE
 */
export const getUserIdentitySource = (verifiedUserInformation: VerifiedUserInformation): SYSTEM_IDENTITY_SOURCE => {
  return coerceUserIdentitySource(verifiedUserInformation.identity_provider);
};

/**
 * Coerce the raw keycloak token identity provider value into an system identity source enum value.
 * If the given user identity source string does not satisfy one of `SYSTEM_IDENTITY_SOURCE`, the return
 * value defaults to `SYSTEM_IDENTITY_SOURCE.DATABASE`.
 *
 * @example coerceUserIdentitySource('idir') => 'idir' satisfies SYSTEM_IDENTITY_SOURCE.IDIR
 *
 * @param {string} userIdentitySource
 * @return {*}  {SYSTEM_IDENTITY_SOURCE} the identity source belonging to type SYSTEM_IDENTITY_SOURCE
 */
export const coerceUserIdentitySource = (userIdentitySource: string): SYSTEM_IDENTITY_SOURCE => {
  switch (userIdentitySource?.toUpperCase()) {
    case SYSTEM_IDENTITY_SOURCE.IDIR:
      return SYSTEM_IDENTITY_SOURCE.IDIR;

    case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
      return SYSTEM_IDENTITY_SOURCE.BCEID_BASIC;

    case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
      return SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS;

    case SYSTEM_IDENTITY_SOURCE.DATABASE:
      return SYSTEM_IDENTITY_SOURCE.DATABASE;

    default:
      // Covers a user created directly in keycloak which wouldn't have an identity source
      return SYSTEM_IDENTITY_SOURCE.DATABASE;
  }
};

/**
 * Returns the user information identifier (aka: username).
 *
 * @example getUserIdentifier({ idir_username: 'jsmith' }) => 'jsmith'
 *
 * @param {VerifiedUserInformation} verifiedUserInformation
 * @return {*}  {string}
 */
export const getUserIdentifier = (verifiedUserInformation: VerifiedUserInformation): string => {
  if (isIdirUserInformation(verifiedUserInformation)) {
    return verifiedUserInformation.idir_username;
  }

  if (isBceidBusinessUserInformation(verifiedUserInformation) || isBceidBasicUserInformation(verifiedUserInformation)) {
    return verifiedUserInformation.bceid_username;
  }

  return verifiedUserInformation.username;
};

/**
 * Get a `VerifiedUserInformation` object from a Keycloak Bearer Token (IDIR or BCeID Basic or BCeID Business token).
 *
 * @param {Record<string, any>} keycloakToken
 * @return {*}  {(VerifiedUserInformation | null)}
 */
export const getVerifiedUserInformationFromKeycloakToken = (
  keycloakToken: Record<string, any>
): VerifiedUserInformation | null => {
  const result = VerifiedUserInformation.safeParse(keycloakToken);

  if (!result.success) {
    return null;
  }

  return result.data;
};

export const isIdirUserInformation = (
  verifiedUserInformation: VerifiedUserInformation
): verifiedUserInformation is IdirUserInformation => {
  return verifiedUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.IDIR.toLowerCase();
};

export const isBceidBasicUserInformation = (
  verifiedUserInformation: VerifiedUserInformation
): verifiedUserInformation is BceidBasicUserInformation => {
  return verifiedUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.BCEID_BASIC.toLowerCase();
};

export const isBceidBusinessUserInformation = (
  verifiedUserInformation: VerifiedUserInformation
): verifiedUserInformation is BceidBusinessUserInformation => {
  return verifiedUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS.toLowerCase();
};

export const isDatabaseUserInformation = (
  verifiedUserInformation: VerifiedUserInformation
): verifiedUserInformation is DatabaseUserInformation => {
  return verifiedUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.DATABASE.toLowerCase();
};
