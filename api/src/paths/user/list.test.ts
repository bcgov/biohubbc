import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { UserService } from '../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as users from './list';

chai.use(sinonChai);

describe('users', () => {
  describe('getUserList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return rows on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      const mockResponse = [
        {
          system_user_id: 1,
          user_identifier: 'testname',
          user_guid: '123-456-789',
          identity_source: 'idir',
          record_end_date: null,
          role_ids: [1, 2],
          role_names: ['System Admin', 'Coordinator'],
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          display_name: 'test name',
          agency: null
        }
      ];

      sinon.stub(UserService.prototype, 'listSystemUsers').resolves(mockResponse);

      const requestHandler = users.getUserList();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockResponse);
    });
  });
});
