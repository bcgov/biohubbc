import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SOURCE_SYSTEM } from '../constants/database';
import { SYSTEM_ROLE } from '../constants/roles';
import * as db from '../database/db';
import { Models } from '../models';
import {
  AuthorizationScheme,
  AuthorizationService,
  AuthorizeByServiceClient,
  AuthorizeBySystemRoles,
  AuthorizeRule
} from '../services/authorization-service';
import { UserService } from '../services/user-service';
import { getMockDBConnection } from '../__mocks__/db';

chai.use(sinonChai);

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
      }
    ];
    const mockDBConnection = getMockDBConnection();

    sinon.stub(AuthorizationService.prototype, 'authorizeBySystemRole').resolves(false);
    sinon.stub(AuthorizationService.prototype, 'authorizeBySystemUser').resolves(true);
    sinon.stub(AuthorizationService.prototype, 'authorizeByServiceClient').resolves(true);

    const authorizationService = new AuthorizationService(mockDBConnection);

    const authorizeResults = await authorizationService.executeAuthorizeConfig(mockAuthorizeRules);

    expect(authorizeResults).to.eql([false, true, true]);
  });
});

describe('authorizeByServiceClient', function () {
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
    } as unknown) as Models.user.UserObject;

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

    const mockGetSystemUsersObjectResponse = (null as unknown) as Models.user.UserObject;
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

    const mockGetSystemUsersObjectResponse = ({ record_end_date: 'datetime' } as unknown) as Models.user.UserObject;
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
      systemUser: ({} as unknown) as Models.user.UserObject
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
      systemUser: ({ role_names: [] } as unknown) as Models.user.UserObject
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
      systemUser: ({ role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] } as unknown) as Models.user.UserObject
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

    const mockGetSystemUsersObjectResponse = (null as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const authorizationService = new AuthorizationService(mockDBConnection);

    const isAuthorizedBySystemRole = await authorizationService.authorizeBySystemUser();

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `systemUserObject` is not null', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const authorizationService = new AuthorizationService(mockDBConnection, {
      systemUser: ({} as unknown) as Models.user.UserObject
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
      keycloakToken: { preferred_username: '' }
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

    const isAuthorizedBySystemRole = await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `systemUserObject` hasAtLeastOneValidValue', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as Models.user.UserObject;
    sinon.stub(AuthorizationService.prototype, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const authorizationService = new AuthorizationService(mockDBConnection, {
      keycloakToken: { clientId: SOURCE_SYSTEM['SIMS-SVC-4464'] }
    });

    const authorizeByServiceClientData = ({
      validServiceClientIDs: SOURCE_SYSTEM['SIMS-SVC-4464'],
      discriminator: 'ServiceClient'
    } as unknown) as AuthorizeByServiceClient;

    const isAuthorizedBySystemRole = await authorizationService.authorizeByServiceClient(authorizeByServiceClientData);

    expect(isAuthorizedBySystemRole).to.equal(true);
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

  it('returns a `UserObject`', async function () {
    const mockDBConnection = getMockDBConnection();

    const mockSystemUserWithRolesResponse = new Models.user.UserObject();
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

    const authorizationService = new AuthorizationService(mockDBConnection);

    const result = await authorizationService.getSystemUserWithRoles();

    expect(result).to.be.null;
  });

  it('returns null if the system user identifier is null', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const authorizationService = new AuthorizationService(mockDBConnection, {
      keycloakToken: { preferred_username: '' }
    });

    const result = await authorizationService.getSystemUserWithRoles();

    expect(result).to.be.null;
  });

  it('returns a UserObject', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const userObjectMock = new Models.user.UserObject();
    sinon.stub(UserService.prototype, 'getUserByGuid').resolves((userObjectMock as unknown) as any);

    const authorizationService = new AuthorizationService(mockDBConnection, {
      keycloakToken: { preferred_username: 'userIdentifier@IDIR' }
    });

    const result = await authorizationService.getSystemUserWithRoles();

    expect(result).to.equal(userObjectMock);
  });
});
