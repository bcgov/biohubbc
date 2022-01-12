import chai, { expect } from 'chai';
import { Request } from 'express';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { ProjectUserObject, UserObject } from '../../models/user';
import project_participation_queries from '../../queries/project-participation';
import { UserService } from '../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as authorization from './authorization';

chai.use(sinonChai);

describe('authorizeRequestHandler', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws a 403 error if the user is not authorized', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(authorization, 'authorizeRequest').resolves(false);

    const mockAuthorizationSchemeCallback = () => {
      return { or: [] };
    };

    const requestHandler = authorization.authorizeRequestHandler(mockAuthorizationSchemeCallback);

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('Access Denied');
      expect((error as HTTPError).status).to.equal(403);
    }

    expect(mockNext).not.to.have.been.called;
  });

  it('calls next if the user is authorized', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(authorization, 'authorizeRequest').resolves(true);

    const mockAuthorizationSchemeCallback = () => {
      return { or: [] };
    };

    const requestHandler = authorization.authorizeRequestHandler(mockAuthorizationSchemeCallback);

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockNext).to.have.been.calledOnce;
  });
});

describe('authorizeRequest', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if systemUserObject is null', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = (undefined as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockSystemUserObject);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if the user is a system administrator', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').resolves(true);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the authorization_scheme is undefined', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').resolves(false);

    const mockReq = ({ authorization_scheme: undefined } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns true if the user is authorized against the authorization_scheme', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').resolves(false);

    sinon.stub(authorization, 'executeAuthorizationScheme').resolves(true);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(true);
  });

  it('returns false if the user is not authorized against the authorization_scheme', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserObject = ({ role_names: [] } as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockSystemUserObject);

    sinon.stub(authorization, 'authorizeSystemAdministrator').resolves(false);

    sinon.stub(authorization, 'executeAuthorizationScheme').resolves(false);

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
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

    const mockReq = ({ authorization_scheme: {} } as unknown) as Request;
    const isAuthorized = await authorization.authorizeRequest(mockReq);

    expect(isAuthorized).to.equal(false);
  });
});

describe('executeAuthorizationScheme', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if any AND authorizationScheme rules return false', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizationScheme = ({ and: [] } as unknown) as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([true, false, true]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
      mockAuthorizationScheme,
      mockDBConnection
    );

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if all AND authorizationScheme rules return true', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizationScheme = ({ and: [] } as unknown) as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([true, true, true]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
      mockAuthorizationScheme,
      mockDBConnection
    );

    expect(isAuthorized).to.equal(true);
  });

  it('returns false if all OR authorizationScheme rules return false', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizationScheme = ({ or: [] } as unknown) as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([false, false, false]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
      mockAuthorizationScheme,
      mockDBConnection
    );

    expect(isAuthorized).to.equal(false);
  });

  it('returns true if any OR authorizationScheme rules return true', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizationScheme = ({ or: [] } as unknown) as authorization.AuthorizationScheme;
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'executeAuthorizeConfig').resolves([false, true, false]);

    const isAuthorized = await authorization.executeAuthorizationScheme(
      mockReq,
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
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizeRules: authorization.AuthorizeRule[] = [
      {
        validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
        discriminator: 'SystemRole'
      },
      {
        validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
        projectId: 1,
        discriminator: 'ProjectRole'
      },
      {
        discriminator: 'SystemUser'
      }
    ];
    const mockDBConnection = getMockDBConnection();

    sinon.stub(authorization, 'authorizeBySystemRole').resolves(true);
    sinon.stub(authorization, 'authorizeByProjectRole').resolves(false);
    sinon.stub(authorization, 'authorizeBySystemUser').resolves(true);

    const authorizeResults = await authorization.executeAuthorizeConfig(mockReq, mockAuthorizeRules, mockDBConnection);

    expect(authorizeResults).to.eql([true, false, true]);
  });
});

describe('authorizeBySystemRole', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `authorizeSystemRoles` is null', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizeSystemRoles = (null as unknown) as authorization.AuthorizeBySystemRoles;
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockReq,
      mockAuthorizeSystemRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if `systemUserObject` is null', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockReq,
      mockAuthorizeSystemRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `authorizeSystemRoles` specifies no valid roles', async function () {
    const mockReq = ({ system_user: {} } as unknown) as Request;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockReq,
      mockAuthorizeSystemRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(true);
  });

  it('returns false if the user does not have any valid roles', async function () {
    const mockReq = ({ system_user: { role_names: [] } } as unknown) as Request;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockReq,
      mockAuthorizeSystemRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if the user has at least one of the valid roles', async function () {
    const mockReq = ({ system_user: { role_names: [SYSTEM_ROLE.PROJECT_CREATOR] } } as unknown) as Request;
    const mockAuthorizeSystemRoles: authorization.AuthorizeBySystemRoles = {
      validSystemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
      discriminator: 'SystemRole'
    };
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemRole(
      mockReq,
      mockAuthorizeSystemRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(true);
  });
});

describe('authorizeByProjectRole', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `authorizeByProjectRole` is null', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizeProjectRoles = (null as unknown) as authorization.AuthorizeByProjectRoles;
    const mockDBConnection = getMockDBConnection();

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if `authorizeProjectRoles.projectId` is null', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizeProjectRoles: authorization.AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: (null as unknown) as number,
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
    const mockReq = ({} as unknown) as Request;
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
    const mockReq = ({} as unknown) as Request;
    const mockAuthorizeProjectRoles: authorization.AuthorizeByProjectRoles = {
      validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
      projectId: 1,
      discriminator: 'ProjectRole'
    };
    const mockDBConnection = getMockDBConnection();

    const mockProjectUserObject = (undefined as unknown) as ProjectUserObject;
    sinon.stub(authorization, 'getProjectUserObject').resolves(mockProjectUserObject);

    const isAuthorizedBySystemRole = await authorization.authorizeByProjectRole(
      mockReq,
      mockAuthorizeProjectRoles,
      mockDBConnection
    );

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns false if the user does not have any valid roles', async function () {
    const mockProjectUserObject = ({ project_role_names: [] } as unknown) as ProjectUserObject;
    const mockReq = ({ project_user: mockProjectUserObject } as unknown) as Request;
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
    const mockProjectUserObject = ({ project_role_names: [PROJECT_ROLE.PROJECT_LEAD] } as unknown) as ProjectUserObject;
    const mockReq = ({ project_user: mockProjectUserObject } as unknown) as Request;
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

describe('authorizeBySystemUser', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns false if `systemUserObject` is null', async function () {
    const mockReq = ({} as unknown) as Request;
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemUser(mockReq, mockDBConnection);

    expect(isAuthorizedBySystemRole).to.equal(false);
  });

  it('returns true if `systemUserObject` is not null', async function () {
    const mockReq = ({ system_user: {} } as unknown) as Request;
    const mockDBConnection = getMockDBConnection();

    const mockGetSystemUsersObjectResponse = (null as unknown) as UserObject;
    sinon.stub(authorization, 'getSystemUserObject').resolves(mockGetSystemUsersObjectResponse);

    const isAuthorizedBySystemRole = await authorization.authorizeBySystemUser(mockReq, mockDBConnection);

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

describe('getSystemUserObject', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws an HTTP500 error if fetching the system user throws an error', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(authorization, 'getSystemUserWithRoles').callsFake(() => {
      throw new Error('Test Error');
    });

    try {
      await authorization.getSystemUserObject(mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('failed to get system user');
      expect((error as HTTPError).status).to.equal(500);
    }
  });

  it('throws an HTTP500 error if the system user is null', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = null;
    sinon.stub(authorization, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    try {
      await authorization.getSystemUserObject(mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('system user was null');
      expect((error as HTTPError).status).to.equal(500);
    }
  });

  it('returns a `UserObject`', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = new UserObject();
    sinon.stub(authorization, 'getSystemUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const systemUserObject = await authorization.getSystemUserObject(mockDBConnection);

    expect(systemUserObject).to.equal(mockSystemUserWithRolesResponse);
  });
});

describe('getSystemUserWithRoles', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns null if the system user id is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => null });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const result = await authorization.getSystemUserWithRoles(mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns a UserObject', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = new UserObject();
    sinon.stub(UserService.prototype, 'getUserById').resolves(mockUsersByIdSQLResponse);

    const result = await authorization.getSystemUserWithRoles(mockDBConnection);

    expect(result).to.equal(mockUsersByIdSQLResponse);
  });
});

describe('getProjectUserObject', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws an HTTP500 error if fetching the system user throws an error', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(authorization, 'getProjectUserWithRoles').callsFake(() => {
      throw new Error('Test Error');
    });

    try {
      await authorization.getProjectUserObject(1, mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('failed to get project user');
      expect((error as HTTPError).status).to.equal(500);
    }
  });

  it('throws an HTTP500 error if the system user is null', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = null;
    sinon.stub(authorization, 'getProjectUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    try {
      await authorization.getProjectUserObject(1, mockDBConnection);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('project user was null');
      expect((error as HTTPError).status).to.equal(500);
    }
  });

  it('returns a `ProjectUserObject`', async function () {
    const mockDBConnection = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockSystemUserWithRolesResponse = {};
    sinon.stub(authorization, 'getProjectUserWithRoles').resolves(mockSystemUserWithRolesResponse);

    const systemUserObject = await authorization.getProjectUserObject(1, mockDBConnection);

    expect(systemUserObject).to.be.instanceOf(ProjectUserObject);
  });
});

describe('getProjectUserWithRoles', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('returns null if the system user id is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => null });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const result = await authorization.getProjectUserWithRoles(1, mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns null if the get user by id SQL statement is null', async function () {
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = null;
    sinon
      .stub(project_participation_queries, 'getProjectParticipationBySystemUserSQL')
      .returns(mockUsersByIdSQLResponse);

    const result = await authorization.getProjectUserWithRoles(1, mockDBConnection);

    expect(result).to.be.null;
  });

  it('returns the first row of the response', async function () {
    const mockResponseRow = { 'Test Column': 'Test Value' };
    const mockQueryResponse = ({ rowCount: 1, rows: [mockResponseRow] } as unknown) as QueryResult<any>;
    const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockUsersByIdSQLResponse = SQL`Test SQL Statement`;
    sinon
      .stub(project_participation_queries, 'getProjectParticipationBySystemUserSQL')
      .returns(mockUsersByIdSQLResponse);

    const result = await authorization.getProjectUserWithRoles(1, mockDBConnection);

    expect(result).to.eql(mockResponseRow);
  });
});
