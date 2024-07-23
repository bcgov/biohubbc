import { DatabaseError } from 'pg';
import { z } from 'zod';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiExecuteSQLError } from '../errors/api-error';
import {
  isBceidBusinessUserInformation,
  isDatabaseUserInformation,
  isIdirUserInformation,
  isServiceClientUserInformation,
  KeycloakUserInformation
} from '../utils/keycloak-utils';

/**
 * A type for a set of generic keycloak user information properties.
 */
type GenericizedKeycloakUserInformation = {
  user_guid: string;
  user_identifier: string;
  user_identity_source: SYSTEM_IDENTITY_SOURCE;
  display_name: string;
  email: string;
  given_name: string;
  family_name: string;
  agency?: string;
};

/**
 * An asynchronous wrapper function that will catch any exceptions thrown by the wrapped function
 *
 * @param fn the function to be wrapped
 * @returns Promise<WrapperReturn> A Promise with the wrapped functions return value
 */
export const asyncErrorWrapper =
  <WrapperArgs extends any[], WrapperReturn>(fn: (...args: WrapperArgs) => Promise<WrapperReturn>) =>
  async (...args: WrapperArgs): Promise<WrapperReturn> => {
    try {
      // asyncErrorWrapper must return the awaited promise, and cannot simply `return fn(...args)`.
      return await fn(...args);
    } catch (err) {
      throw parseError(err);
    }
  };

/**
 * A synchronous wrapper function that will catch any exceptions thrown by the wrapped function
 *
 * @param fn the function to be wrapped
 * @returns WrapperReturn The wrapped functions return value
 */
export const syncErrorWrapper =
  <WrapperArgs extends any[], WrapperReturn>(fn: (...args: WrapperArgs) => WrapperReturn) =>
  (...args: WrapperArgs): WrapperReturn => {
    try {
      return fn(...args);
    } catch (err) {
      throw parseError(err);
    }
  };

/**
 * This function parses the passed in error and translates them into a human readable error
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html for postgres error codes
 *
 * @param error error to be parsed
 * @returns an error to throw
 */
const parseError = (error: any) => {
  if (error instanceof z.ZodError) {
    throw new ApiExecuteSQLError('SQL response failed schema check', [error]);
  }

  if (error instanceof DatabaseError) {
    if (error.message === 'CONCURRENCY_EXCEPTION') {
      // error thrown by DB trigger based on revision_count
      // will be thrown if two updates to the same record are made concurrently
      throw new ApiExecuteSQLError('Failed to update stale data', [error]);
    }

    if (error.code === '23503') {
      // error thrown by DB when query fails due to foreign key constraint
      throw new ApiExecuteSQLError('Failed to delete record due to foreign key constraint', [error]);
    }
  }

  // Generic error thrown if not captured above
  throw new ApiExecuteSQLError('Failed to execute SQL', [error]);
};

/**
 * Converts a type specific keycloak user information object with type specific properties into a new object with
 * generic properties.
 *
 * @param {KeycloakUserInformation} keycloakUserInformation
 * @return {*}  {(GenericizedKeycloakUserInformation | null)}
 */
export const getGenericizedKeycloakUserInformation = (
  keycloakUserInformation: KeycloakUserInformation
): GenericizedKeycloakUserInformation | null => {
  let data: GenericizedKeycloakUserInformation | null;

  if (isDatabaseUserInformation(keycloakUserInformation) || isServiceClientUserInformation(keycloakUserInformation)) {
    // Don't patch internal database/service client user records
    return null;
  }

  // We don't yet know at this point what kind of token was used (idir vs bceid basic, etc).
  // Determine which type it is, and parse the information into a generic structure that is supported by the
  // database patch function
  if (isIdirUserInformation(keycloakUserInformation)) {
    data = {
      user_guid: keycloakUserInformation.idir_user_guid,
      user_identifier: keycloakUserInformation.idir_username,
      user_identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
      display_name: keycloakUserInformation.display_name,
      email: keycloakUserInformation.email,
      given_name: keycloakUserInformation.given_name,
      family_name: keycloakUserInformation.family_name
    };
  } else if (isBceidBusinessUserInformation(keycloakUserInformation)) {
    data = {
      user_guid: keycloakUserInformation.bceid_user_guid,
      user_identifier: keycloakUserInformation.bceid_username,
      user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS,
      display_name: keycloakUserInformation.display_name,
      email: keycloakUserInformation.email,
      given_name: keycloakUserInformation.given_name,
      family_name: keycloakUserInformation.family_name,
      agency: keycloakUserInformation.bceid_business_name
    };
  } else {
    data = {
      user_guid: keycloakUserInformation.bceid_user_guid,
      user_identifier: keycloakUserInformation.bceid_username,
      user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
      display_name: keycloakUserInformation.display_name,
      email: keycloakUserInformation.email,
      given_name: keycloakUserInformation.given_name,
      family_name: keycloakUserInformation.family_name
    };
  }

  return data;
};
