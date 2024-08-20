import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { UserService } from '../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { getSelf } from './self';

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
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
    }
  });

  it('should return the user row on success', async () => {
    const dbConnectionObj = getMockDBConnection({
      systemUserId: () => 1
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      system_user_id: 1,
      user_identifier: 'testuser',
      user_guid: '123456789',
      identity_source: 'idir',
      record_end_date: null,
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2'],
      email: 'email@email.com',
      family_name: 'lname',
      given_name: 'fname',
      display_name: 'test name',
      agency: null
    });

    const requestHandler = getSelf();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue.system_user_id).to.equal(1);
    expect(mockRes.jsonValue.user_identifier).to.equal('testuser');
    expect(mockRes.jsonValue.role_ids).to.eql([1, 2]);
    expect(mockRes.jsonValue.role_names).to.eql(['role 1', 'role 2']);
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection({
      systemUserId: () => 1
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const expectedError = new Error('cannot process query');

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        throw expectedError;
      }
    });

    try {
      const requestHandler = getSelf();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });
});
