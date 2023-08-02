import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { UserService } from '../../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as system_roles from './update';

chai.use(sinonChai);

describe('updateSystemRolesHandler', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('re-throws the error thrown by UserService.deleteUserSystemRoles', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      userId: '1'
    };
    mockReq.body = {
      roles: [1]
    };

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      system_user_id: 1,
      user_identifier: 'test name',
      user_guid: 'aaaa',
      identity_source: 'idir',
      record_end_date: new Date(),
      role_ids: [11, 22],
      role_names: ['role 11', 'role 22'],
      permission_ids: [],
      permission_names: []
    });

    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').rejects(new Error('a delete error'));

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a delete error');
    }
  });

  it('re-throws the error thrown by UserService.addUserSystemRoles', async () => {
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

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      system_user_id: 1,
      user_identifier: 'test name',
      user_guid: 'aaaa',
      identity_source: 'idir',
      record_end_date: new Date(),
      role_ids: [11, 22],
      role_names: ['role 11', 'role 22'],
      permission_ids: [],
      permission_names: []
    });

    sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'addUserSystemRoles').rejects(new Error('an add error'));

    try {
      const requestHandler = system_roles.updateSystemRolesHandler();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an add error');
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

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      system_user_id: 1,
      user_identifier: 'test name',
      user_guid: 'aaaa',
      identity_source: 'idir',
      record_end_date: new Date(),
      role_ids: [11, 22],
      role_names: ['role 1', 'role 2'],
      permission_ids: [],
      permission_names: []
    });

    const deleteUserSystemRolesStub = sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'addUserSystemRoles').resolves();

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

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      system_user_id: 1,
      user_identifier: 'test name',
      user_guid: 'aaaa',
      identity_source: 'idir',
      record_end_date: new Date(),
      role_ids: [],
      role_names: [],
      permission_ids: [],
      permission_names: []
    });

    const deleteUserSystemRolesStub = sinon.stub(UserService.prototype, 'deleteUserSystemRoles').resolves();
    sinon.stub(UserService.prototype, 'addUserSystemRoles').resolves();

    const requestHandler = system_roles.updateSystemRolesHandler();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(deleteUserSystemRolesStub).not.to.have.been.called;
    expect(mockRes.statusValue).to.equal(200);
  });
});
