import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { PROJECT_PERMISSION, PROJECT_ROLE, SYSTEM_ROLE } from '../constants/roles';
import * as db from '../database/db';
import { ProjectUser } from '../repositories/project-participation-repository';
import { SystemUser } from '../repositories/user-repository';
import {
  AuthorizationScheme,
  AuthorizationService,
  AuthorizeByProjectPermission,
  AuthorizeByServiceClient,
  AuthorizeBySystemRoles,
  AuthorizeRule
} from '../services/authorization-service';
import { UserService } from '../services/user-service';
import { KeycloakUserInformation, ServiceClientUserInformation } from '../utils/keycloak-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectParticipationService } from './project-participation-service';

chai.use(sinonChai);

describe('AuthorizationService', () => {
  describe('executeAuthorizationScheme', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns false if any AND authorizationScheme rules return false', async function () {
      const mockAuthorizationScheme = ({ and: [] } as unknown) as AuthorizationScheme;
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([true, false, true]);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

      expect(isAuthorized).to.equal(false);
    });

    it('returns true if all AND authorizationScheme rules return true', async function () {
      const mockAuthorizationScheme = ({ and: [] } as unknown) as AuthorizationScheme;
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([true, true, true]);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

      expect(isAuthorized).to.equal(true);
    });

    it('returns false if all OR authorizationScheme rules return false', async function () {
      const mockAuthorizationScheme = ({ or: [] } as unknown) as AuthorizationScheme;
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'executeAuthorizeConfig').resolves([false, false, false]);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorized = await authorizationService.executeAuthorizationScheme(mockAuthorizationScheme);

      expect(isAuthorized).to.equal(false);
    });

    it('returns true if any OR authorizationScheme rules return true', async function () {
      const mockAuthorizationScheme = ({ or: [] } as unknown) as AuthorizationScheme;
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
          validProjectPermissions: [PROJECT_PERMISSION.COLLABORATOR],
          projectId: 1,
          discriminator: 'ProjectPermission'
        }
      ];
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'authorizeBySystemRole').resolves(false);
      sinon.stub(AuthorizationService.prototype, 'authorizeBySystemUser').resolves(true);
      sinon.stub(AuthorizationService.prototype, 'authorizeByServiceClient').resolves(true);
      sinon.stub(AuthorizationService.prototype, 'authorizeByProjectPermission').resolves(false);

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

    it('returns true if `systemUserObject` is not null and includes admin role', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = ({
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
      } as unknown) as SystemUser;

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
      const mockAuthorizeSystemRoles = (null as unknown) as AuthorizeBySystemRoles;
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

      const mockGetSystemUsersObjectResponse = (null as unknown) as SystemUser;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemRole(mockAuthorizeSystemRoles);

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns false if `record_end_date` is null', async function () {
      const mockAuthorizeSystemRoles: AuthorizeBySystemRoles = {
        validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        discriminator: 'SystemRole'
      };
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = ({ record_end_date: 'datetime' } as unknown) as SystemUser;
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
        systemUser: ({} as unknown) as SystemUser
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
        systemUser: ({ role_names: [] } as unknown) as SystemUser
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
        systemUser: ({ role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] } as unknown) as SystemUser
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

      const mockGetSystemUsersObjectResponse = (null as unknown) as SystemUser;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemUser();

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns true if `systemUserObject` is not null', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = (null as unknown) as SystemUser;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        systemUser: ({} as unknown) as SystemUser
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

      const authorizeByServiceClientData = ({
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown) as AuthorizeByServiceClient;

      const result = await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

      expect(result).to.be.false;
    });

    it('returns null if the system user identifier is null', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: { preferred_username: '' } as KeycloakUserInformation
      });

      const authorizeByServiceClientData = ({
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown) as AuthorizeByServiceClient;

      const result = await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

      expect(result).to.be.false;
    });

    it('returns false if `systemUserObject` is null', async function () {
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection);

      const authorizeByServiceClientData = ({
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown) as AuthorizeByServiceClient;

      const isAuthorizedBySystemRole = await authorizationService.authorizeByServiceClient(
        authorizeByServiceClientData
      );

      expect(isAuthorizedBySystemRole).to.equal(false);
    });

    it('returns true if `systemUserObject` hasAtLeastOneValidValue', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = (null as unknown) as SystemUser;
      sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: { clientId: SOURCE_SYSTEM['SIMS-SVC-4464'] } as ServiceClientUserInformation
      });

      const authorizeByServiceClientData = ({
        validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
        discriminator: 'ServiceClient'
      } as unknown) as AuthorizeByServiceClient;

      const isAuthorizedBySystemRole = await authorizationService.authorizeByServiceClient(
        authorizeByServiceClientData
      );

      expect(isAuthorizedBySystemRole).to.equal(true);
    });
  });

  describe('authorizeByProjectPermission', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns false if `authorizeProjectPermission` is null', async function () {
      const mockAuthorizeProjectPermission = (null as unknown) as AuthorizeByProjectPermission;
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedByProjectPermission = await authorizationService.authorizeByProjectPermission(
        mockAuthorizeProjectPermission
      );

      expect(isAuthorizedByProjectPermission).to.equal(false);
    });

    it('returns false if `projectUserObject` is null', async function () {
      const mockAuthorizeProjectPermission: AuthorizeByProjectPermission = {
        validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
        projectId: 1,
        discriminator: 'ProjectPermission'
      };
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = (null as unknown) as ProjectUser & SystemUser;
      sinon.stub(AuthorizationService.prototype, 'getProjectUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedByProjectPermission = await authorizationService.authorizeByProjectPermission(
        mockAuthorizeProjectPermission
      );

      expect(isAuthorizedByProjectPermission).to.equal(false);
    });

    it('returns false if `record_end_date` is null', async function () {
      const mockAuthorizeProjectPermission: AuthorizeByProjectPermission = {
        validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
        projectId: 1,
        discriminator: 'ProjectPermission'
      };
      const mockDBConnection = getMockDBConnection();

      const mockGetSystemUsersObjectResponse = ({ record_end_date: 'datetime' } as unknown) as ProjectUser & SystemUser;
      sinon.stub(AuthorizationService.prototype, 'getProjectUserObject').resolves(mockGetSystemUsersObjectResponse);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const isAuthorizedByProjectPermission = await authorizationService.authorizeByProjectPermission(
        mockAuthorizeProjectPermission
      );

      expect(isAuthorizedByProjectPermission).to.equal(false);
    });

    it('returns true if `authorizeProjectPermission` specifies no valid permissions', async function () {
      const mockAuthorizeProjectPermission: AuthorizeByProjectPermission = {
        validProjectPermissions: [],
        projectId: 1,
        discriminator: 'ProjectPermission'
      };
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection, {
        projectUser: ({ project_id: 1 } as unknown) as ProjectUser & SystemUser
      });

      const isAuthorizedByProjectPermission = await authorizationService.authorizeByProjectPermission(
        mockAuthorizeProjectPermission
      );

      expect(isAuthorizedByProjectPermission).to.equal(true);
    });

    it('returns false if the user does not have any valid permissions', async function () {
      const mockAuthorizeProjectPermission: AuthorizeByProjectPermission = {
        validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
        projectId: 1,
        discriminator: 'ProjectPermission'
      };
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection, {
        projectUser: ({ project_id: 1, project_role_permissions: [] } as unknown) as ProjectUser & SystemUser
      });

      const isAuthorizedByProjectPermission = await authorizationService.authorizeByProjectPermission(
        mockAuthorizeProjectPermission
      );

      expect(isAuthorizedByProjectPermission).to.equal(false);
    });

    it('returns true if the user has at least one of the valid permissions', async function () {
      const mockAuthorizeProjectPermission: AuthorizeByProjectPermission = {
        validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
        projectId: 1,
        discriminator: 'ProjectPermission'
      };
      const mockDBConnection = getMockDBConnection();

      const authorizationService = new AuthorizationService(mockDBConnection, {
        projectUser: ({
          project_id: 1,
          project_role_permissions: [PROJECT_PERMISSION.COORDINATOR]
        } as unknown) as ProjectUser & SystemUser
      });

      const isAuthorizedByProjectPermission = await authorizationService.authorizeByProjectPermission(
        mockAuthorizeProjectPermission
      );

      expect(isAuthorizedByProjectPermission).to.equal(true);
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

        it('returns false if the user has no matching roles', () => {
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

        it('returns false if the user has no matching roles', () => {
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

      const mockSystemUserWithRolesResponse: SystemUser = {
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

      const userObjectMock: SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Collaborator'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      sinon.stub(UserService.prototype, 'getUserByGuid').resolves((userObjectMock as unknown) as any);

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

  describe('getProjectUserObject', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if fetching the project user throws an error', async function () {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(AuthorizationService.prototype, 'getSystemUserWithRoles').callsFake(() => {
        throw new Error('Test Error');
      });

      const authorizationService = new AuthorizationService(mockDBConnection);

      const projectId = 1;

      const projectUser = await authorizationService.getProjectUserObject(projectId);

      expect(projectUser).to.equal(null);
    });

    it('returns null if the project user is null or undefined', async function () {
      const mockDBConnection = getMockDBConnection();

      const projectUserMock = null;
      sinon.stub(AuthorizationService.prototype, 'getProjectUserWithRoles').resolves(projectUserMock);

      const authorizationService = new AuthorizationService(mockDBConnection);

      const projectId = 1;

      const projectUser = await authorizationService.getProjectUserObject(projectId);

      expect(projectUser).to.equal(null);
    });

    it('returns a project user when keycloak token is valid', async function () {
      const mockDBConnection = getMockDBConnection();

      const projectUserMock: ProjectUser & SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Collaborator'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null,
        project_participation_id: 3,
        project_id: 1,
        project_role_ids: [1],
        project_role_names: [PROJECT_ROLE.COLLABORATOR],
        project_role_permissions: [PROJECT_ROLE.COLLABORATOR]
      };

      sinon.stub(AuthorizationService.prototype, 'getProjectUserWithRoles').resolves(projectUserMock);

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

      const projectId = 1;

      const projectUser = await authorizationService.getProjectUserObject(projectId);

      expect(projectUser).to.equal(projectUserMock);
    });
  });

  describe('getProjectUserWithRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the keycloak token is null', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const authorizationService = new AuthorizationService(mockDBConnection, {
        keycloakToken: undefined
      });

      const projectId = 1;

      const result = await authorizationService.getProjectUserWithRoles(projectId);

      expect(result).to.be.null;
    });

    it('returns a project user when keycloak token is valid', async function () {
      const mockDBConnection = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const projectUserMock: ProjectUser & SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Collaborator'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null,
        project_participation_id: 3,
        project_id: 1,
        project_role_ids: [1],
        project_role_names: [PROJECT_ROLE.COLLABORATOR],
        project_role_permissions: [PROJECT_ROLE.COLLABORATOR]
      };
      sinon
        .stub(ProjectParticipationService.prototype, 'getProjectParticipantByUserGuid')
        .resolves((projectUserMock as unknown) as any);

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

      const projectId = 1;

      const result = await authorizationService.getProjectUserWithRoles(projectId);

      expect(result).to.equal(projectUserMock);
    });
  });
});
