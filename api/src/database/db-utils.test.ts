import { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import { z } from 'zod';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import {
  BceidBasicUserInformation,
  BceidBusinessUserInformation,
  DatabaseUserInformation,
  IdirUserInformation
} from '../utils/keycloak-utils';
import { getGenericizedKeycloakUserInformation, getZodQueryResult } from './db-utils';

/**
 * Enforces that a zod schema satisfies an existing type definition.
 *
 * Code copied from: https://github.com/colinhacks/zod/issues/372#issuecomment-1280054492
 * An unresolved feature request was opened as well: https://github.com/colinhacks/zod/issues/2084
 *
 * Note: This may not be sufficient to cover ALL possible scenarios.
 *
 * @example
 * const myZodSchema = z.object({...});
 * // Compile error if `myZodSchema` doesn't satisfy `TypeDefinitionToCompareTo`
 * zodImplements<TypeDefinitionToCompareTo>().with(myZodSchema.shape);
 *
 * @template Model
 * @return {*}
 */
function zodImplements<Model = never>() {
  type ZodImplements<Model> = {
    [key in keyof Model]-?: undefined extends Model[key]
      ? null extends Model[key]
        ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
        : z.ZodOptionalType<z.ZodType<Model[key]>>
      : null extends Model[key]
      ? z.ZodNullableType<z.ZodType<Model[key]>>
      : z.ZodType<Model[key]>;
  };

  return {
    with: <
      Schema extends ZodImplements<Model> &
        {
          [unknownKey in Exclude<keyof Schema, keyof Model>]: never;
        }
    >(
      schema: Schema
    ) => z.object(schema)
  };
}

describe('getZodQueryResult', () => {
  it('defines a zod schema that conforms to the real pg `QueryResult` type', () => {
    const zodQueryResultRow = z.object({});

    const zodQueryResult = getZodQueryResult(zodQueryResultRow);

    // Not a traditional test: will just cause a compile error if the zod schema doesn't satisfy the `QueryResult` type
    zodImplements<QueryResult>().with(zodQueryResult.shape);

    // Dummy assertion to satisfy linter
    expect(true).to.be.true;
  });
});

describe('getGenericizedKeycloakUserInformation', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('identifies a database user information object and returns null', () => {
    const keycloakUserInformation: DatabaseUserInformation = {
      database_user_guid: '123456789',
      identity_provider: 'database',
      username: 'biohub_dapi_v1'
    };

    const result = getGenericizedKeycloakUserInformation(keycloakUserInformation);

    expect(result).to.be.null;
  });

  it('identifies an idir user information object and returns a genericized object', () => {
    const keycloakUserInformation: IdirUserInformation = {
      idir_user_guid: '123456789',
      identity_provider: 'idir',
      idir_username: 'testuser',
      email_verified: false,
      name: 'test user',
      preferred_username: 'testguid@idir',
      display_name: 'test user',
      given_name: 'test',
      family_name: 'user',
      email: 'email@email.com'
    };

    const result = getGenericizedKeycloakUserInformation(keycloakUserInformation);

    expect(result).to.eql({
      user_guid: keycloakUserInformation.idir_user_guid,
      user_identifier: keycloakUserInformation.idir_username,
      user_identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
      display_name: keycloakUserInformation.display_name,
      email: keycloakUserInformation.email,
      given_name: keycloakUserInformation.given_name,
      family_name: keycloakUserInformation.family_name
    });
  });

  it('identifies a bceid business user information object and returns a genericized object', () => {
    const keycloakUserInformation: BceidBusinessUserInformation = {
      bceid_business_guid: '1122334455',
      bceid_business_name: 'Business Name',
      bceid_user_guid: '123456789',
      identity_provider: 'bceidbusiness',
      bceid_username: 'tname',
      name: 'Test Name',
      preferred_username: '123456789@bceidbusiness',
      display_name: 'Test Name',
      email: 'email@email.com',
      email_verified: false,
      given_name: 'Test',
      family_name: ''
    };

    const result = getGenericizedKeycloakUserInformation(keycloakUserInformation);

    expect(result).to.eql({
      user_guid: keycloakUserInformation.bceid_user_guid,
      user_identifier: keycloakUserInformation.bceid_username,
      user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS,
      display_name: keycloakUserInformation.display_name,
      email: keycloakUserInformation.email,
      given_name: keycloakUserInformation.given_name,
      family_name: keycloakUserInformation.family_name,
      agency: keycloakUserInformation.bceid_business_name
    });
  });

  it('identifies a bceid basic user information object and returns a genericized object', () => {
    const keycloakUserInformation: BceidBasicUserInformation = {
      bceid_user_guid: '123456789',
      identity_provider: 'bceidbasic',
      bceid_username: 'tname',
      name: 'Test Name',
      preferred_username: '123456789@bceidbasic',
      display_name: 'Test Name',
      email: 'email@email.com',
      email_verified: false,
      given_name: 'Test',
      family_name: ''
    };

    const result = getGenericizedKeycloakUserInformation(keycloakUserInformation);

    expect(result).to.eql({
      user_guid: keycloakUserInformation.bceid_user_guid,
      user_identifier: keycloakUserInformation.bceid_username,
      user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
      display_name: keycloakUserInformation.display_name,
      email: keycloakUserInformation.email,
      given_name: keycloakUserInformation.given_name,
      family_name: keycloakUserInformation.family_name
    });
  });
});
