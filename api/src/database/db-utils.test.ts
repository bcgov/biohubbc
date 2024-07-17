import { expect } from 'chai';
import sinon from 'sinon';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import {
  BceidBasicUserInformation,
  BceidBusinessUserInformation,
  DatabaseUserInformation,
  IdirUserInformation
} from '../utils/keycloak-utils';
import { getGenericizedKeycloakUserInformation } from './db-utils';

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
