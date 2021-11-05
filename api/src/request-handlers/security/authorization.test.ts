import chai, { expect } from 'chai';
import { Request } from 'express';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { ProjectUserObject, UserObject } from '../../models/user';
import { getMockDBConnection } from '../../__mocks__/db';
import * as projectUser from '../user/project-user';
import * as systemUser from '../user/system-user';
import * as authorization from './authorization';

chai.use(sinonChai);

describe('authorize', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if systemUserObject is null', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = undefined as unknown as UserObject;
    sinon.stub(systemUser, 'getSystemUserObject').resolves(mockSystemUserObject);

    const mockReq = { authorization_scheme: {} } as unknown as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if the user is a system administrator', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = { role_names: [] } as unknown as UserObject;
    sinon.stub(systemUser, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').returns(true);

    const mockReq = { authorization_scheme: {} } as unknown as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the authorization_scheme is undefined', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = { role_names: [] } as unknown as UserObject;
    sinon.stub(systemUser, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').returns(false);

    const mockReq = { authorization_scheme: undefined } as unknown as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the user is authorized against the authorization_scheme', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = { role_names: [] } as unknown as UserObject;
    sinon.stub(systemUser, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').returns(false);

    sinon.stub(authorization, 'executeAuthorizationScheme').resolves(true);

    const mockReq = { authorization_scheme: {} } as unknown as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns false if the user is not authorized against the authorization_scheme', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = { role_names: [] } as unknown as UserObject;
    sinon.stub(systemUser, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').returns(false);

    sinon.stub(authorization, 'executeAuthorizationScheme').resolves(false);

    const mockReq = { authorization_scheme: {} } as unknown as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });

  it('returns false if an error is thrown', async function () {
    const mockDBConnection = getMockDBConnection({
      open: () => {
        throw new Error('Test Error');
      }
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockReq = {} as unknown as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });
});

describe('executeAuthorizationScheme', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if any AND authorizationScheme rules return false', async function () {
    const mockReq = {} as unknown as Request;
    const mockSystemUserObject = undefined as unknown as UserObject;
    const mockAuthorizationScheme = { and: [] } as unknown as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([true, false, true]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
      mockSystemUserObject,
      mockAuthorizationScheme,
      mockDBConnection
    );

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if all AND authorizationScheme rules return true', async function () {
    const mockReq = {} as unknown as Request;
    const mockSystemUserObject = undefined as unknown as UserObject;
    const mockAuthorizationScheme = { and: [] } as unknown as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([true, true, true]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
      mockSystemUserObject,
      mockAuthorizationScheme,
      mockDBConnection
    );

    expect(isAuthorized).to.equal(true);
  });

  it('returns false if all OR authorizationScheme rules return false', async function () {
    const mockReq = {} as unknown as Request;
    const mockSystemUserObject = undefined as unknown as UserObject;
    const mockAuthorizationScheme = { or: [] } as unknown as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([false, false, false]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
      mockSystemUserObject,
      mockAuthorizationScheme,
      mockDBConnection
    );

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if any OR authorizationScheme rules return true', async function () {
    const mockReq = {} as unknown as Request;
    const mockSystemUserObject = undefined as unknown as UserObject;
    const mockAuthorizationScheme = { or: [] } as unknown as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([false, true, false]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
      mockSystemUserObject,
      mockAuthorizationScheme,
      mockDBConnection
    );

    expect(isAuthorized).to.equal(true);
  });
});

describe('executeAuthorizeConfig', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns an array of authorizeRule results', async function () {
    const mockReq = {} as unknown as Request;
    const mockSystemUserObject = undefined as unknown as UserObject;
    const mockAuthorizeRules: authorization.AuthorizeRule[] = [
      {
        validSystemRoles: [SYSTEM_ROLE.PROJECT_ADMIN],
        discriminator: 'SystemRole'
      },
      {
        validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
        projectId: 1,
        discriminator: 'ProjectRole'
      }
    ];
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'authorizeBySystemRole').returns(true);
    sinon.stub(authorization, 'authorizeByProjectRole').resolves(false);

    const authorizeResults = await authorization.executeAuthorizeConfig(
      mockReq,
      mockSystemUserObject,
      mockAuthorizeRules,
      mockDBConnection
    );

    expect(authorizeResults).to.eql([true, false]);
  });
});

describe('authorizeBySystemRole', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `systemUserObject` is null', async function () {
    const mockSystemUserObject = null as unknown as UserObject;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_ADMIN],
      discriminator: 'SystemRole'
    };

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockSystemUserObject,
      mockAuthorizeSystemRoles
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if `authorizeSystemRoles` is null', async function () {
    const mockSystemUserObject = {} as unknown as UserObject;
    const mockAuthorizeSystemRoles = null as unknown as authorization.AuthorizeBySystemRoles;

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockSystemUserObject,
      mockAuthorizeSystemRoles
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `authorizeSystemRoles` specifies no valid roles', async function () {
    const mockSystemUserObject = {} as unknown as UserObject;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [],
      discriminator: 'SystemRole'
    };

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockSystemUserObject,
      mockAuthorizeSystemRoles
    );

    expect(isAuthorizedBySystemRole).to.equal(true);
  });

  it('returns false if the user does not have any valid roles', async function () {
    const mockSystemUserObject = { role_names: [] } as unknown as UserObject;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_ADMIN],
      discriminator: 'SystemRole'
    };

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockSystemUserObject,
      mockAuthorizeSystemRoles
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if the user has at least one of the valid roles', async function () {
    const mockSystemUserObject = { role_names: [SYSTEM_ROLE.PROJECT_ADMIN] } as unknown as UserObject;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_ADMIN],
      discriminator: 'SystemRole'
    };

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockSystemUserObject,
      mockAuthorizeSystemRoles
    );

    expect(isAuthorizedBySystemRole).to.equal(true);
  });
});

describe('authorizeByProjectRole', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `authorizeByProjectRole` is null', async function () {
    const mockReq = {} as unknown as Request;
    const mockAuthorizeProjectRoles = null as unknown as authorization.AuthorizeByProjectRoles;
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if `authorizeProjectRoles.projectId` is null', async function () {
    const mockReq = {} as unknown as Request;
    const mockAuthorizeProjectRoles: authorization.AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: null as unknown as number,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `authorizeByProjectRole` specifies no valid roles', async function () {
    const mockReq = {} as unknown as Request;
    const mockAuthorizeProjectRoles: authorization.AuthorizeByProjectRoles = {
      validProjectRoles: [],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(true);
  });

  it('returns false if it fails to fetch the users project role information', async function () {
    const mockReq = {} as unknown as Request;
    const mockAuthorizeProjectRoles: authorization.AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const mockProjectUserObject = undefined as unknown as ProjectUserObject;
    sinon.stub(projectUser, 'getProjectUserObject').resolves(mockProjectUserObject);

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if the user does not have any valid roles', async function () {
    const mockProjectUserObject = { project_role_names: [] } as unknown as ProjectUserObject;
    const mockReq = { project_user: mockProjectUserObject } as unknown as Request;
    const mockAuthorizeProjectRoles: authorization.AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if the user has at lest one of the valid roles', async function () {
    const mockProjectUserObject = { project_role_names: [PROJECT_ROLE.PROJECT_LEAD] } as unknown as ProjectUserObject;
    const mockReq = { project_user: mockProjectUserObject } as unknown as Request;
    const mockAuthorizeProjectRoles: authorization.AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(true);
  });
});

describe('userHasValidRole', () => {
  describe('validSystemRoles is a string', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidRole('', '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = authorization.userHasValidRole('admin', '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidRole('admin', 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidRole('admin', 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidRole('', []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidRole('admin', []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidRole('admin', ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidRole('admin', ['admin']);

        expect(response).to.be.true;
      });
    });
  });

  describe('validSystemRoles is an array', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidRole([], '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = authorization.userHasValidRole(['admin'], '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidRole(['admin'], 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidRole(['admin'], 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = authorization.userHasValidRole([], []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidRole(['admin'], []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = authorization.userHasValidRole(['admin'], ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = authorization.userHasValidRole(['admin'], ['admin']);

        expect(response).to.be.true;
      });
    });
  });
});
