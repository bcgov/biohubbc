import { expect } from 'chai';
import { describe } from 'mocha';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import {
  BceidBasicUserInformation,
  BceidBusinessUserInformation,
  coerceUserIdentitySource,
  DatabaseUserInformation,
  getUserGuid,
  getUserIdentifier,
  getUserIdentitySource,
  IdirUserInformation,
  isBceidBasicUserInformation,
  isBceidBusinessUserInformation,
  isDatabaseUserInformation,
  isIdirUserInformation,
  ServiceClientUserInformation
} from './keycloak-utils';

describe('keycloakUtils', () => {
  describe('getUserGuid', () => {
    it('returns idir guid', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = getUserGuid(keycloakUserInformation);

      expect(response).to.equal('123456789');
    });

    it('returns bceid basic guid', () => {
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

      const response = getUserGuid(keycloakUserInformation);

      expect(response).to.equal('123456789');
    });

    it('returns bceid business guid', () => {
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

      const response = getUserGuid(keycloakUserInformation);

      expect(response).to.equal('123456789');
    });

    it('returns database guid', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = getUserGuid(keycloakUserInformation);

      expect(response).to.equal('123456789');
    });
  });

  describe('getUserIdentifier', () => {
    it('returns idir username', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = getUserIdentifier(keycloakUserInformation);

      expect(response).to.equal('tname');
    });

    it('returns bceid basic username', () => {
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

      const response = getUserIdentifier(keycloakUserInformation);

      expect(response).to.equal('tname');
    });

    it('returns bceid business username', () => {
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

      const response = getUserIdentifier(keycloakUserInformation);

      expect(response).to.equal('tname');
    });

    it('returns database username', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = getUserIdentifier(keycloakUserInformation);

      expect(response).to.equal('biohub_dapi_v1');
    });
  });

  describe('getUserIdentitySource', () => {
    it('returns idir source', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.IDIR);
    });

    it('returns bceid basic source', () => {
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

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID_BASIC);
    });

    it('returns bceid business source', () => {
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

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS);
    });

    it('returns database source', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
    });
  });

  describe('coerceUserIdentitySource', () => {
    it('should coerce empty string user identity to DATABASE', () => {
      const response = coerceUserIdentitySource('');
      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
    });
    it('should coerce null string user identity to DATABASE', () => {
      const response = coerceUserIdentitySource((null as unknown) as string);
      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
    });
    it('should coerce bceid basic user identity to BCEIDBASIC', () => {
      const response = coerceUserIdentitySource('bceidbasic');
      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID_BASIC);
    });
    it('should coerce bceid business user identity to BCEIDBUSINESS', () => {
      const response = coerceUserIdentitySource('bceidbusiness');
      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS);
    });
    it('should coerce idir user identity to IDIR', () => {
      const response = coerceUserIdentitySource('idir');
      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.IDIR);
    });
    it('should coerce database user identity to DATABASE', () => {
      const response = coerceUserIdentitySource('database');
      expect(response).to.equal(SYSTEM_IDENTITY_SOURCE.DATABASE);
    });
  });

  describe('getKeycloakUserInformationFromKeycloakToken', () => {
    it('returns valid idir token information', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).not.to.be.null;
    });

    it('returns valid bceid basic token information', () => {
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

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).not.to.be.null;
    });

    it('returns valid bceid business token information', () => {
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

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).not.to.be.null;
    });

    it('returns valid database token information', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).not.to.be.null;
    });

    it('returns valid system token information', () => {
      const keycloakUserInformation: ServiceClientUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = getUserIdentitySource(keycloakUserInformation);

      expect(response).not.to.be.null;
    });
  });

  describe('isIdirUserInformation', () => {
    it('returns true when idir token information provided', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = isIdirUserInformation(keycloakUserInformation);

      expect(response).to.be.true;
    });

    it('returns false when bceid basic token information provided', () => {
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

      const response = isIdirUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns false when bceid business token information provided', () => {
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

      const response = isIdirUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns false when database token information provided', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = isIdirUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });
  });

  describe('isBceidBasicUserInformation', () => {
    it('returns false when idir token information provided', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = isBceidBasicUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns true when bceid basic token information provided', () => {
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

      const response = isBceidBasicUserInformation(keycloakUserInformation);

      expect(response).to.be.true;
    });

    it('returns false when bceid business token information provided', () => {
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

      const response = isBceidBasicUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns false when database token information provided', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = isBceidBasicUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });
  });

  describe('isBceidBusinessUserInformation', () => {
    it('returns false when idir token information provided', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = isBceidBusinessUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns false when bceid basic token information provided', () => {
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

      const response = isBceidBusinessUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns true when bceid business token information provided', () => {
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

      const response = isBceidBusinessUserInformation(keycloakUserInformation);

      expect(response).to.be.true;
    });

    it('returns false when database token information provided', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = isBceidBusinessUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });
  });

  describe('isDatabaseUserInformation', () => {
    it('returns false when idir token information provided', () => {
      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@idir',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const response = isDatabaseUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns false when bceid basic token information provided', () => {
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

      const response = isDatabaseUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns false when bceid business token information provided', () => {
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

      const response = isDatabaseUserInformation(keycloakUserInformation);

      expect(response).to.be.false;
    });

    it('returns true when database token information provided', () => {
      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const response = isDatabaseUserInformation(keycloakUserInformation);

      expect(response).to.be.true;
    });
  });
});
