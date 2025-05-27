import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../constants/roles';
import * as db from '../database/db';
import { SystemUserWithRoles } from '../models/system-user-view';
import { SurveyMember } from '../repositories/survey-member-repository';
import {
  AuthorizationScheme,
  AuthorizationService,
  AuthorizeByServiceClient,
  AuthorizeBySurveyRole,
  AuthorizeBySystemRoles,
  AuthorizeRule
} from '../services/authorization-service';
import { UserService } from '../services/user-service';
import { KeycloakUserInformation, ServiceClientUserInformation } from '../utils/keycloak-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyMemberService } from './survey-member-service';

chai.use(sinonChai);

describe('AuthorizationService', () => {
  describe('executeAuthorizationScheme', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns false if any AND authorizationScheme rules return false', async function () {
      const mockAuthorizationScheme = { and: [] } as unknown as AuthorizationScheme;
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([true, false, true]);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

      expect(isAuthorized).to.equal(false);
    });

    it('returns true if all AND authorizationScheme rules return true', async function () {
      const mockAuthorizationScheme = { and: [] } as unknown as AuthorizationScheme;
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([true, true, true]);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

      expect(isAuthorized).to.equal(true);
    });

    it('returns false if all OR authorizationScheme rules return false', async function () {
      const mockAuthorizationScheme = { or: [] } as unknown as AuthorizationScheme;
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([false, false, false]);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

      expect(isAuthorized).to.equal(false);
    });

    it('returns true if any OR authorizationScheme rules return true', async function () {
      const mockAuthorizationScheme = { or: [] } as unknown as AuthorizationScheme;
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([false, true, false]);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

      expect(isAuthorized).to.equal(true);
    });
  });

  describe('executeAuthorizeConfig', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns an array of authorizeRule results', async function () {
      const mockAuthorizeRules: AuthorizeRule[] = [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        },
        {
          discriminator: 'SystemUser'
        },
        {
          validServiceClientIDs: [SOURCE_SYSTEM['SIMS-SVC-4464']],
          discriminator: 'ServiceClient'
        },
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        }
      ];
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'authorizeBySystemRole').resolves(false);
      sinon.stub(AuthorizationService.prototype, 'authorizeBySystemUser').resolves(true);
      sinon.stub(AuthorizationService.prototype, 'authorizeByServiceClient').resolves(true);
      sinon.stub(AuthorizationService.prototype, 'authorizeBySurveyRole').resolves(false);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const authorizeResults = await authorizationService.executeAuthorizeConfig(mockAuthorizeRules);

      expect(authorizeResults).to.eql([false, true, true, false]);
    });
  });

  describe('authorizeSystemAdministrator', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns false if `systemUserObject` is null', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(null);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedByServiceClient = await authorizationService.authorizeSystemAdministrator();

      expect(isAuthorizedByServiceClient).to.equal(false);
    });

    it('returns false if `record_end_date` is not null', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse: SystemUserWithRoles = {
        system_user_id: 20,
        user_guid: '123-456-789',
        user_identifier: 'test-identifier',
        identity_source: 'IDIR',
        display_name: 'test-user',
        given_name: 'test-given',
        family_name: 'test-family',
        email: 'test-email',
        agency: 'test-agency',
        record_end_date: '2021-01-01',
        role_ids: [1],
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
      };

      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedByServiceClient = await authorizationService.authorizeSystemAdministrator();

      expect(isAuthorizedByServiceClient).to.equal(false);
    });

    it('returns true if `systemUserObject` is not null and includes admin role', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse: SystemUserWithRoles = {
        system_user_id: 20,
        user_guid: '123-456-789',
        user_identifier: 'test-identifier',
        identity_source: 'IDIR',
        display_name: 'test-user',
        given_name: 'test-given',
        family_name: 'test-family',
        email: 'test-email',
        agency: 'test-agency',
        record_end_date: null,
        role_ids: [1],
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
      };

      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedByServiceClient = await authorizationService.authorizeSystemAdministrator();

      expect(isAuthorizedByServiceClient).to.equal(true);
    });
  });

  describe('authorizeBySystemRole', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns false if `authorizeSystemRoles` is null', async function () {
      const mockAuthorizeSystemRoles = null as unknown as AuthorizeBySystemRoles;
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns false if `systemUserObject` is null', async function () {
      const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        discriminator: 'SystemRole'
      };
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = null as unknown as SystemUserWithRoles;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns false if `record_end_date` is not null', async function () {
      const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        discriminator: 'SystemRole'
      };
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse: SystemUserWithRoles = {
        system_user_id: 20,
        user_guid: '123-456-789',
        user_identifier: 'test-identifier',
        identity_source: 'IDIR',
        display_name: 'test-user',
        given_name: 'test-given',
        family_name: 'test-family',
        email: 'test-email',
        agency: 'test-agency',
        record_end_date: '2021-01-01',
        role_ids: [3],
        role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
      };
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns true if `authorizeSystemRoles` specifies no valid roles', async function () {
      const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
        validSystemRoles: [],
        discriminator: 'SystemRole'
      };
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection, {
        systemUser: {
          system_user_id: 20,
          user_guid: '123-456-789',
          user_identifier: 'test-identifier',
          identity_source: 'IDIR',
          display_name: 'test-user',
          given_name: 'test-given',
          family_name: 'test-family',
          email: 'test-email',
          agency: 'test-agency',
          record_end_date: null,
          role_ids: [3],
          role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
        }
      });

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

      expect(isAuthorizedBySystemRole).to.equal(true);
    });

    it('returns false if the user does not have any valid roles', async function () {
      const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        discriminator: 'SystemRole'
      };
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection, {
        systemUser: {
          system_user_id: 20,
          user_guid: '123-456-789',
          user_identifier: 'test-identifier',
          identity_source: 'IDIR',
          display_name: 'test-user',
          given_name: 'test-given',
          family_name: 'test-family',
          email: 'test-email',
          agency: 'test-agency',
          record_end_date: null,
          role_ids: [],
          role_names: []
        }
      });

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns true if the user has at least one of the valid roles', async function () {
      const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        discriminator: 'SystemRole'
      };
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection, {
        systemUser: {
          system_user_id: 20,
          user_guid: '123-456-789',
          user_identifier: 'test-identifier',
          identity_source: 'IDIR',
          display_name: 'test-user',
          given_name: 'test-given',
          family_name: 'test-family',
          email: 'test-email',
          agency: 'test-agency',
          record_end_date: null,
          role_ids: [1],
          role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
        }
      });

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

      expect(isAuthorizedBySystemRole).to.equal(true);
    });
  });

  describe('authorizeBySystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns false if `systemUserObject` is null', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = null as unknown as SystemUserWithRoles;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemUser();

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns true if `systemUserObject` is not null', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = null as unknown as SystemUserWithRoles;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        systemUser: {
          system_user_id: 20,
          user_guid: '123-456-789',
          user_identifier: 'test-identifier',
          identity_source: 'IDIR',
          display_name: 'test-user',
          given_name: 'test-given',
          family_name: 'test-family',
          email: 'test-email',
          agency: 'test-agency',
          record_end_date: null,
          role_ids: [3],
          role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
        }
      });

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemUser();

      expect(isAuthorizedBySystemRole).to.equal(true);
    });
  });

  describe('authorizeByServiceClient', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns false if the keycloak token is null', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const authorizeByServiceClientData = {
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown as AuthorizeByServiceClient;

      const result = await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

      expect(result).to.be.false;
    });

    it('returns null if the system user identifier is null', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: { preferred_username: '' } as KeycloakUserInformation
      });

      const authorizeByServiceClientData = {
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown as AuthorizeByServiceClient;

      const result = await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

      expect(result).to.be.false;
    });

    it('returns false if `systemUserObject` is null', async function () {
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection);

      const authorizeByServiceClientData = {
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown as AuthorizeByServiceClient;

      const isAuthorizedBySystemRole =
        await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns true if `systemUserObject` hasAtLeastOneValidValue', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = null as unknown as SystemUserWithRoles;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: { clientId: SOURCE_SYSTEM['SIMS-SVC-4464'] } as ServiceClientUserInformation
      });

      const authorizeByServiceClientData = {
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown as AuthorizeByServiceClient;

      const isAuthorizedBySystemRole =
        await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

      expect(isAuthorizedBySystemRole).to.equal(true);
    });
  });

  describe('authorizeBySurveyRole', function () {
    describe('by survey id', function () {
      afterEach(() => {
        sinon.restore();
      });

      it('returns false if `authorizeSurveyRole` is null', async function () {
        const mockAuthorizeSurveyRole = null as unknown as AuthorizeBySurveyRole;
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection);

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns false if `surveyUserObject` is null', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const mockGetSystemUsersObjectResponse = null as unknown as SurveyMember & SystemUserWithRoles;
        sinon
          .stub(AuthorizationService.prototype, 'getSurveyMemberObjectBySurveyId')
          .resolves(mockGetSystemUsersObjectResponse);

        const authorizationService = new AuthorizationService(mockDBConnection);

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns false if `record_end_date` is not null', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const mockGetSystemUsersObjectResponse: SurveyMember & SystemUserWithRoles = {
          survey_id: 1,
          system_user_id: 20,
          user_guid: '123-456-789',
          user_identifier: 'test-identifier',
          identity_source: 'IDIR',
          display_name: 'test-user',
          given_name: 'test-given',
          family_name: 'test-family',
          email: 'test-email',
          agency: 'test-agency',
          record_end_date: '2021-01-01',
          role_ids: [3],
          role_names: [SYSTEM_ROLE.PROJECT_CREATOR],
          survey_member_id: 2,
          survey_role_id: 1,
          survey_role_name: [SURVEY_ROLE.ADMIN]
        };
        sinon
          .stub(AuthorizationService.prototype, 'getSurveyMemberObjectBySurveyId')
          .resolves(mockGetSystemUsersObjectResponse);

        const authorizationService = new AuthorizationService(mockDBConnection);

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns true if `authorizeSurveyRole` specifies no valid permissions', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection, {
          surveyUser: {
            survey_id: 1,
            system_user_id: 2,
            user_identifier: 'username',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            user_guid: '123-456-789',
            record_end_date: null,
            role_ids: [1],
            role_names: ['Editor'],
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            display_name: 'test user',
            agency: null,
            survey_member_id: 3,

            survey_role_id: 1,
            survey_role_name: [SURVEY_ROLE.ADMIN]
          }
        });

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(true);
      });

      it('returns false if the user does not have any valid permissions', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection, {
          surveyUser: {
            survey_id: 1,
            system_user_id: 2,
            user_identifier: 'username',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            user_guid: '123-456-789',
            record_end_date: null,
            role_ids: [1],
            role_names: ['Editor'],
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            display_name: 'test user',
            agency: null,
            survey_member_id: 3,
            survey_role_id: [],
            survey_role_name: []
          }
        });

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns true if the user has at least one of the valid permissions', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection, {
          surveyUser: {
            survey_id: 1,
            system_user_id: 2,
            user_identifier: 'username',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            user_guid: '123-456-789',
            record_end_date: null,
            role_ids: [1],
            role_names: ['Admin'],
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            display_name: 'test user',
            agency: null,
            survey_member_id: 3,

            survey_role_id: 1,
            survey_role_name: [SURVEY_ROLE.ADMIN]
          }
        });

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(true);
      });
    });

    describe('by survey id', function () {
      afterEach(() => {
        sinon.restore();
      });

      it('returns false if `authorizeSurveyRole` is null', async function () {
        const mockAuthorizeSurveyRole = null as unknown as AuthorizeBySurveyRole;
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection);

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns false if `surveyUserObject` is null', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const mockGetSystemUsersObjectResponse = null as unknown as SurveyMember & SystemUserWithRoles;
        sinon
          .stub(AuthorizationService.prototype, 'getSurveyMemberObjectBySurveyId')
          .resolves(mockGetSystemUsersObjectResponse);

        const authorizationService = new AuthorizationService(mockDBConnection);

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns false if `record_end_date` is not null', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const mockGetSystemUsersObjectResponse: SurveyMember & SystemUserWithRoles = {
          survey_id: 1,
          system_user_id: 2,
          user_identifier: 'username',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          user_guid: '123-456-789',
          record_end_date: '2021-01-01',
          role_ids: [1],
          role_names: ['Editor'],
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          display_name: 'test user',
          agency: null,
          survey_member_id: 3,

          survey_role_id: 1,
          survey_role_name: [SURVEY_ROLE.ADMIN]
        };
        sinon
          .stub(AuthorizationService.prototype, 'getSurveyMemberObjectBySurveyId')
          .resolves(mockGetSystemUsersObjectResponse);

        const authorizationService = new AuthorizationService(mockDBConnection);

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns true if `authorizeSurveyRole` specifies no valid permissions', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection, {
          surveyUser: {
            survey_id: 1,
            system_user_id: 2,
            user_identifier: 'username',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            user_guid: '123-456-789',
            record_end_date: null,
            role_ids: [1],
            role_names: ['Editor'],
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            display_name: 'test user',
            agency: null,
            survey_member_id: 3,

            survey_role_id: [],
            survey_role_name: []
          }
        });

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(true);
      });

      it('returns false if the user does not have any valid permissions', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection, {
          surveyUser: {
            survey_id: 1,
            system_user_id: 2,
            user_identifier: 'username',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            user_guid: '123-456-789',
            record_end_date: null,
            role_ids: [1],
            role_names: ['Editor'],
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            display_name: 'test user',
            agency: null,
            survey_member_id: 3,

            survey_role_id: [],
            survey_role_name: []
          }
        });

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(false);
      });

      it('returns true if the user has at least one of the valid permissions', async function () {
        const mockAuthorizeSurveyRole: AuthorizeBySurveyRole = {
          validSurveyRoles: [SURVEY_ROLE.ADMIN],
          surveyId: 1,
          discriminator: 'SurveyRole'
        };
        const mockDBConnection = getMockDBConnection();

        const authorizationService = new AuthorizationService(mockDBConnection, {
          surveyUser: {
            survey_id: 1,
            system_user_id: 2,
            user_identifier: 'username',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            user_guid: '123-456-789',
            record_end_date: null,
            role_ids: [1],
            role_names: ['Admin'],
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            display_name: 'test user',
            agency: null,
            survey_member_id: 3,

            survey_role_id: 1,
            survey_role_name: [SURVEY_ROLE.ADMIN]
          }
        });

        const isAuthorizedBySurveyRole = await authorizationService.authorizeBySurveyRole(mockAuthorizeSurveyRole);

        expect(isAuthorizedBySurveyRole).to.equal(true);
      });
    });
  });

  describe('hasAtLeastOneValidValue', () => {
    describe('validValues is a string', () => {
      describe('incomingValues is a string', () => {
        it('returns true if the valid roles is empty', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('', '');

          expect(response).to.be.true;
        });

        it('returns false if the user has no roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('admin', '');

          expect(response).to.be.false;
        });

        it('returns false if the user has no matching roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('admin', 'user');

          expect(response).to.be.false;
        });

        it('returns true if the user has a matching role', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('admin', 'admin');

          expect(response).to.be.true;
        });
      });

      describe('incomingValues is an array', () => {
        it('returns true if the valid roles is empty', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('', []);

          expect(response).to.be.true;
        });

        it('returns false if the user has no roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('admin', []);

          expect(response).to.be.false;
        });

        it('returns false if the user has no matching roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('admin', ['user']);

          expect(response).to.be.false;
        });

        it('returns true if the user has a matching role', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue('admin', ['admin']);

          expect(response).to.be.true;
        });
      });
    });

    describe('validValues is an array', () => {
      describe('incomingValues is a string', () => {
        it('returns true if the valid roles is empty', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue([], '');

          expect(response).to.be.true;
        });

        it('returns false if the user has no roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue(['admin'], '');

          expect(response).to.be.false;
        });

        it('returns false if the user has no matching roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue(['admin'], 'user');

          expect(response).to.be.false;
        });

        it('returns true if the user has a matching role', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue(['admin'], 'admin');

          expect(response).to.be.true;
        });
      });

      describe('incomingValues is an array', () => {
        it('returns true if the valid roles is empty', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue([], []);

          expect(response).to.be.true;
        });

        it('returns false if the user has no roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue(['admin'], []);

          expect(response).to.be.false;
        });

        it('returns false if the user has no matching roles', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue(['admin'], ['user']);

          expect(response).to.be.false;
        });

        it('returns true if the user has a matching role', () => {
          const response = AuthorizationService.hasAtLeastOneValidValue(['admin'], ['admin']);

          expect(response).to.be.true;
        });
      });
    });
  });

  describe('getSystemUserObject', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if fetching the system user throws an error', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').callsFake(() => {
        throw new Error('Test Error');
      });

      const authorizationService = new AuthorizationService(mockDBConnection);

      const systemUserObject = await authorizationService.getSystemUserObject();

      expect(systemUserObject).to.equal(null);
    });

    it('returns null if the system user is null or undefined', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockSystemUserWithRolesResponse = null;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const systemUserObject = await authorizationService.getSystemUserObject();

      expect(systemUserObject).to.equal(null);
    });

    it('returns a system user', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockSystemUserWithRolesResponse: SystemUserWithRoles = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };
      sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const systemUserObject = await authorizationService.getSystemUserObject();

      expect(systemUserObject).to.equal(mockSystemUserWithRolesResponse);
    });
  });

  describe('getSystemUserWithRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the keycloak token is null', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: undefined
      });

      const result = await authorizationService.getSystemUserWithRoles();

      expect(result).to.be.null;
    });

    it('returns a UserObject', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const userObjectMock: SystemUserWithRoles = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      sinon.stub(UserService.prototype, 'getUserByGuid').resolves(userObjectMock as unknown as any);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: {
          idir_user_guid: '123-456-789',
          identity_provider: 'idir',
          idir_username: 'testuser',
          email_verified: false,
          name: 'test user',
          preferred_username: 'testguid@idir',
          display_name: 'test user',
          given_name: 'test',
          family_name: 'user',
          email: 'email@email.com'
        }
      });

      const result = await authorizationService.getSystemUserWithRoles();

      expect(result).to.equal(userObjectMock);
    });
  });

  describe('getSurveyMemberObjectBySurveyId', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if fetching the survey user throws an error', async function () {
      const mockDBConnection = getMockDBConnection();

      const surveyId = 1;

      sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').callsFake(() => {
        throw new Error('Test Error');
      });

      const authorizationService = new AuthorizationService(mockDBConnection);

      const surveyUser = await authorizationService.getSurveyMemberObjectBySurveyId(surveyId);

      expect(surveyUser).to.equal(null);
    });

    it('returns null if the survey user is null or undefined', async function () {
      const mockDBConnection = getMockDBConnection();
      const surveyId = 1;

      const surveyUserMock = null;
      sinon.stub(AuthorizationService.prototype, 'getSurveyMemberWithRolesBySurveyId').resolves(surveyUserMock);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const surveyUser = await authorizationService.getSurveyMemberObjectBySurveyId(surveyId);

      expect(surveyUser).to.equal(null);
    });

    it('returns a survey user when keycloak token is valid', async function () {
      const mockDBConnection = getMockDBConnection();

      const surveyId = 1;

      const surveyUserMock: SurveyMember & SystemUserWithRoles = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null,
        survey_member_id: 3,
        survey_id: 1,
        survey_role_id: 1,
        survey_role_name: [SURVEY_ROLE.ADMIN]
      };

      sinon.stub(AuthorizationService.prototype, 'getSurveyMemberWithRolesBySurveyId').resolves(surveyUserMock);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: {
          idir_user_guid: '123-456-789',
          identity_provider: 'idir',
          idir_username: 'username',
          email_verified: false,
          name: 'test user',
          preferred_username: '123-456-789@idir',
          display_name: 'test user',
          given_name: 'test',
          family_name: 'user',
          email: 'email@email.com'
        }
      });

      const surveyUser = await authorizationService.getSurveyMemberObjectBySurveyId(surveyId);

      expect(surveyUser).to.equal(surveyUserMock);
    });
  });

  describe('getSurveyMemberWithRolesBySurveyId', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the keycloak token is null', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const surveyId = 1;

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: undefined
      });

      const result = await authorizationService.getSurveyMemberWithRolesBySurveyId(surveyId);

      expect(result).to.be.null;
    });

    it('returns a survey user when keycloak token is valid', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const surveyId = 1;

      const surveyUserMock: SurveyMember & SystemUserWithRoles = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null,
        survey_member_id: 3,
        survey_id: 1,
        survey_role_id: 1,
        survey_role_name: [SURVEY_ROLE.ADMIN]
      };
      sinon
        .stub(SurveyMemberService.prototype, 'getSurveyMemberBySurveyIdAndUserGuid')
        .resolves(surveyUserMock as unknown as any);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: {
          idir_user_guid: '123-456-789',
          identity_provider: 'idir',
          idir_username: 'username',
          name: 'test user',
          preferred_username: '123-456-789@idir',
          display_name: 'test user',
          email: 'email@email.com',
          email_verified: false,
          given_name: 'fname',
          family_name: 'lname'
        }
      });

      const result = await authorizationService.getSurveyMemberWithRolesBySurveyId(surveyId);

      expect(result).to.equal(surveyUserMock);
    });
  });

  describe('getSurveyMemberObjectBySurveyId', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if fetching the survey user throws an error', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').callsFake(() => {
        throw new Error('Test Error');
      });
      const surveyId = 1;

      const authorizationService = new AuthorizationService(mockDBConnection);

      const surveyUser = await authorizationService.getSurveyMemberObjectBySurveyId(surveyId);

      expect(surveyUser).to.equal(null);
    });

    it('returns null if the survey user is null or undefined', async function () {
      const mockDBConnection = getMockDBConnection();

      const surveyId = 1;
      const surveyUserMock = null;
      sinon.stub(AuthorizationService.prototype, 'getSurveyMemberWithRolesBySurveyId').resolves(surveyUserMock);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const surveyUser = await authorizationService.getSurveyMemberObjectBySurveyId(surveyId);

      expect(surveyUser).to.equal(null);
    });

    it('returns a survey user when keycloak token is valid', async function () {
      const mockDBConnection = getMockDBConnection();

      const surveyId = 1;
      const surveyUserMock: SurveyMember & SystemUserWithRoles = {
        survey_id: 1,
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null,
        survey_member_id: 3,

        survey_role_id: 1,
        survey_role_name: [SURVEY_ROLE.ADMIN]
      };

      sinon.stub(AuthorizationService.prototype, 'getSurveyMemberWithRolesBySurveyId').resolves(surveyUserMock);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: {
          idir_user_guid: '123-456-789',
          identity_provider: 'idir',
          idir_username: 'username',
          email_verified: false,
          name: 'test user',
          preferred_username: '123-456-789@idir',
          display_name: 'test user',
          given_name: 'test',
          family_name: 'user',
          email: 'email@email.com'
        }
      });

      const surveyUser = await authorizationService.getSurveyMemberObjectBySurveyId(surveyId);

      expect(surveyUser).to.equal(surveyUserMock);
    });
  });

  describe('getSurveyMemberWithRolesBySurveyId', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the keycloak token is null', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const surveyId = 1;

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: undefined
      });

      const result = await authorizationService.getSurveyMemberWithRolesBySurveyId(surveyId);

      expect(result).to.be.null;
    });

    it('returns a survey user when keycloak token is valid', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
      const surveyId = 1;

      const surveyUserMock: SurveyMember & SystemUserWithRoles = {
        survey_id: 1,
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null,
        survey_member_id: 3,

        survey_role_id: 1,
        survey_role_name: [SURVEY_ROLE.ADMIN]
      };
      sinon
        .stub(SurveyMemberService.prototype, 'getSurveyMemberBySurveyIdAndUserGuid')
        .resolves(surveyUserMock as unknown as any);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: {
          idir_user_guid: '123-456-789',
          identity_provider: 'idir',
          idir_username: 'username',
          name: 'test user',
          preferred_username: '123-456-789@idir',
          display_name: 'test user',
          email: 'email@email.com',
          email_verified: false,
          given_name: 'fname',
          family_name: 'lname'
        }
      });

      const result = await authorizationService.getSurveyMemberWithRolesBySurveyId(surveyId);

      expect(result).to.equal(surveyUserMock);
    });
  });
});
