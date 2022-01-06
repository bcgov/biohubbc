import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import system_role_queries from '../../../../queries/users';
import * as authorization from '../../../../request-handlers/security/authorization';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as system_roles from './create';

chai.use(sinonChai);

describe('getAddSystemRolesHandler', () => {
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

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = system_roles.getAddSystemRolesHandler();

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

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const requestHandler = system_roles.getAddSystemRolesHandler();

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
      const requestHandler = system_roles.getAddSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get system user');
    }
  });

  it('should throw a 400 when fails to build SQL insert statement ', async () => {
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
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] });

    sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(null);

    try {
      const requestHandler = system_roles.getAddSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should throw a 400 when fails to add system roles ', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({ rowCount: 0 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon
      .stub(authorization, 'getSystemUserById')
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [11, 22], role_names: ['role 11', 'role 22'] });

    sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(SQL`some query`);

    try {
      const requestHandler = system_roles.getAddSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to add system roles');
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
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [1, 2], role_names: ['role 1', 'role 2'] });

    const requestHandler = system_roles.getAddSystemRolesHandler();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });

  it('should send a 200 on success (when user has no existing roles)', async () => {
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
      .resolves({ id: 1, user_identifier: 'test name', role_ids: [], role_names: ['role 11', 'role 22'] });

    sinon.stub(system_role_queries, 'postSystemRolesSQL').returns(SQL`some query`);

    const requestHandler = system_roles.getAddSystemRolesHandler();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });
});
