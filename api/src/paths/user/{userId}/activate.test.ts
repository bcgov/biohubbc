import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { UserService } from '../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as activate_endpoint from './activate';

chai.use(sinonChai);

describe('activateSystemUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return 200 on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { userId: '1' };
    mockReq.body = { roles: [1, 2] };

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(UserService.prototype, 'getUserById').resolves({
      system_user_id: 1,
      user_identifier: 'testname',
      user_guid: '123-456-789',
      identity_source: 'idir',
      record_end_date: null,
      role_ids: [1, 2],
      role_names: ['System Admin', 'Admin'],
      email: 'email@email.com',
      family_name: 'lname',
      given_name: 'fname',
      display_name: 'test name',
      agency: null
    });

    sinon.stub(UserService.prototype, 'activateSystemUser').resolves();

    const requestHandler = activate_endpoint.activateSystemUser();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
  });
});
