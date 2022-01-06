import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import system_role_queries from '../../../../queries/users';
import user_queries from '../../../../queries/users';
import * as authorization from '../../../../request-handlers/security/authorization';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as system_roles from './update';
import * as update_endpoint from './update';

chai.use(sinonChai);

describe('updateSystemRolesHandler', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when missing required path param: userId', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: ''
    };
    mockReq.body = {
      roles: [1]
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: userId');
    }
  });

  it('should throw a 400 error when missing roles in request body', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: null
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param: roles');
    }
  });

  it('should throw a 400 error when no system user found', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(authorization, 'getSystemUserById').resolves(null);

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get system user');
    }
  });

  it('should throw a 400 when fails to build SQL delete statement (user has roles to be deleted)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon
      .stub(authorization, 'getSystemUserById')
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] });

    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(null);

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should throw a 400 when fails to build SQL insert statement', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rows: [], rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon
      .stub(authorization, 'getSystemUserById')
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] });

    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(SQL`some query`);
    sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(null);

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should throw a 500 when fails to insert user role', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rows: [], rowCount: 1 });
    mockQuery.onCall(1).resolves(null);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon
      .stub(authorization, 'getSystemUserById')
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] });

    sinon.stub(user_queries, 'deleteAllSystemRolesSQL').returns(SQL`some query`);
    sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(SQL`some query`);

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert user roles');
    }
  });

  it('should send a 200 on success (when user has existing roles)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon
      .stub(authorization, 'getSystemUserById')
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 1', 'role 2'] });

    const deleteUserSystemRolesStub = sinon.stub(update_endpoint, 'deleteUserSystemRoles').resolves();
    sinon.stub(update_endpoint, 'addUserSystemRoles').resolves();

    const requestHandler = system_roles.updateSystemRolesHandler();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(deleteUserSystemRolesStub).to.have.been.calledOnce;
    expect(mockRes.statusValue).to.equal(200);
  });

  it('should send a 200 on success (when user does not have existing roles)', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon
      .stub(authorization, 'getSystemUserById')
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [], role_names: [] });

    const deleteUserSystemRolesStub = sinon.stub(update_endpoint, 'deleteUserSystemRoles').resolves();
    sinon.stub(update_endpoint, 'addUserSystemRoles').resolves();

    const requestHandler = system_roles.updateSystemRolesHandler();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(deleteUserSystemRolesStub).not.to.have.been.called;
    expect(mockRes.statusValue).to.equal(200);
  });
});
