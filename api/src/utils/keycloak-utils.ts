import { z } from 'zod';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';

/**
 * User information from a verified IDIR Keycloak token.
 */
export const IdirUserInformation = z.object({
  idir_user_guid: z.string().toLowerCase(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.IDIR.toLowerCase()),
  idir_username: z.string().toLowerCase(),
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
 * User information for a keycloak service client userF.
 */
export const ServiceClientUserInformation = z.object({
  database_user_guid: z.string(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.SYSTEM.toLowerCase()),
  username: z.string()
});

/**
 * User information for an internal database user.
 */
export const DatabaseUserInformation = z.object({
  database_user_guid: z.string(),
  identity_provider: z.literal(SYSTEM_IDENTITY_SOURCE.DATABASE.toLowerCase()),
  username: z.string()
});

export type DatabaseUserInformation = z.infer<typeof DatabaseUserInformation>;

export type ServiceClientUserInformation = z.infer<typeof ServiceClientUserInformation>;

/**
 * User information from either an IDIR or BCeID Basic or BCeID Business Keycloak token.
 */
export const KeycloakUserInformation = z.discriminatedUnion('identity_provider', [
  IdirUserInformation,
  BceidBasicUserInformation,
  BceidBusinessUserInformation,
  ServiceClientUserInformation,
  DatabaseUserInformation
]);

export type KeycloakUserInformation = z.infer<typeof KeycloakUserInformation>;

/**
 * Returns the user information guid.
 *
 * @param {KeycloakUserInformation} keycloakUserInformation
 * @return {*}  {(string | null)}
 */
export const getUserGuid = (keycloakUserInformation: KeycloakUserInformation): string => {
  if (isIdirUserInformation(keycloakUserInformation)) {
    return keycloakUserInformation.idir_user_guid;
  }

  if (isBceidBusinessUserInformation(keycloakUserInformation) || isBceidBasicUserInformation(keycloakUserInformation)) {
    return keycloakUserInformation.bceid_user_guid;
  }

  return keycloakUserInformation.database_user_guid;
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
export const getUserIdentitySource = (keycloakUserInformation: KeycloakUserInformation): SYSTEM_IDENTITY_SOURCE => {
  return coerceUserIdentitySource(keycloakUserInformation.identity_provider);
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

    case SYSTEM_IDENTITY_SOURCE.SYSTEM:
      return SYSTEM_IDENTITY_SOURCE.SYSTEM;

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
 * @param {KeycloakUserInformation} keycloakUserInformation
 * @return {*}  {string}
 */
export const getUserIdentifier = (keycloakUserInformation: KeycloakUserInformation): string => {
  if (isIdirUserInformation(keycloakUserInformation)) {
    return keycloakUserInformation.idir_username;
  }

  if (isBceidBusinessUserInformation(keycloakUserInformation) || isBceidBasicUserInformation(keycloakUserInformation)) {
    return keycloakUserInformation.bceid_username;
  }

  return keycloakUserInformation.username;
};

/**
 * Get a `KeycloakUserInformation` object from a Keycloak Bearer Token (IDIR or BCeID Basic or BCeID Business token).
 *
 * @param {Record<string, any>} keycloakToken
 * @return {*}  {(KeycloakUserInformation | null)}
 */
export const getKeycloakUserInformationFromKeycloakToken = (
  keycloakToken: Record<string, any>
): KeycloakUserInformation | null => {
  const result = KeycloakUserInformation.safeParse(keycloakToken);

  if (!result.success) {
    return null;
  }

  return result.data;
};

export const isIdirUserInformation = (
  keycloakUserInformation: KeycloakUserInformation
): keycloakUserInformation is IdirUserInformation => {
  return keycloakUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.IDIR.toLowerCase();
};

export const isBceidBasicUserInformation = (
  keycloakUserInformation: KeycloakUserInformation
): keycloakUserInformation is BceidBasicUserInformation => {
  return keycloakUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.BCEID_BASIC.toLowerCase();
};

export const isBceidBusinessUserInformation = (
  keycloakUserInformation: KeycloakUserInformation
): keycloakUserInformation is BceidBusinessUserInformation => {
  return keycloakUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS.toLowerCase();
};

export const isDatabaseUserInformation = (
  keycloakUserInformation: KeycloakUserInformation
): keycloakUserInformation is DatabaseUserInformation => {
  return keycloakUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.DATABASE.toLowerCase();
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
