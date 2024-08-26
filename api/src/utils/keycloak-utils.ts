import { JwtPayload } from 'jsonwebtoken';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';

/**
 * User information from a verified IDIR Keycloak token.
 */
export type IdirUserInformation = {
  idir_user_guid: string;
  identity_provider: 'idir';
  idir_username: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  display_name: string;
  given_name: string;
  family_name: string;
  email: string;
};

/**
 * User information from a verified BCeID Basic Keycloak token.
 */
export type BceidBasicUserInformation = {
  bceid_user_guid: string;
  identity_provider: 'bceidbasic';
  bceid_username: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  display_name: string;
  given_name: string;
  family_name: string;
  email: string;
};

/**
 * User information from a verified BCeID Keycloak token.
 */
export type BceidBusinessUserInformation = {
  bceid_business_guid: string;
  bceid_business_name: string;
  bceid_user_guid: string;
  identity_provider: 'bceidbusiness';
  bceid_username: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  display_name: string;
  given_name: string;
  family_name: string;
  email: string;
};

/**
 * User information for a keycloak service client userF.
 */
export type ServiceClientUserInformation = {
  database_user_guid: string;
  identity_provider: 'system';
  username: string;
  clientId?: string;
  azp?: string;
};

/**
 * User information for an internal database user.
 */
export type DatabaseUserInformation = {
  database_user_guid: string;
  identity_provider: 'database';
  username: string;
};

/**
 * User information from either an IDIR or BCeID Basic or BCeID Business Keycloak token.
 */
export type KeycloakUserInformation = JwtPayload &
  (
    | IdirUserInformation
    | BceidBasicUserInformation
    | BceidBusinessUserInformation
    | ServiceClientUserInformation
    | DatabaseUserInformation
  );

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

export const isServiceClientUserInformation = (
  keycloakUserInformation: KeycloakUserInformation
): keycloakUserInformation is ServiceClientUserInformation => {
  return keycloakUserInformation.identity_provider === SYSTEM_IDENTITY_SOURCE.SYSTEM.toLowerCase();
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
