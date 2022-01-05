import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { UserService } from '../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as self from './self';

chai.use(sinonChai);

describe('getUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no system user id', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = self.getUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
    }
  });

  it('should throw a 400 error when no sql statement produced', async () => {
    const dbConnectionObj = getMockDBConnection({ systemUserId: () => 1 });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(UserService.prototype, 'getUserById').resolves(null);

    try {
      const requestHandler = self.getUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get system user');
    }
  });

  it('should return the user row on success', async () => {
    const dbConnectionObj = getMockDBConnection({ systemUserId: () => 1 });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      id: 1,
      user_identifier: 'identifier',
      record_end_date: '',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    const requestHandler = self.getUser();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue.id).to.equal(1);
    expect(mockRes.jsonValue.user_identifier).to.equal('identifier');
    expect(mockRes.jsonValue.role_ids).to.eql([1, 2]);
    expect(mockRes.jsonValue.role_names).to.eql(['role 1', 'role 2']);
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection({ systemUserId: () => 1 });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const expectedError = new Error('cannot process query');

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        throw expectedError;
      }
    });

    try {
      const requestHandler = self.getUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });
});
