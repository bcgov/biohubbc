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

      const mockTotal = 10;
      const mockPaginationParams = {
        total: mockTotal,
        per_page: 10,
        current_page: 1,
        last_page: 1,
        sort: undefined,
        order: undefined
      };
      const mockUsers = [
        {
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
        }
      ];

      const mockResponse = {
        users: mockUsers,
        pagination: mockPaginationParams
      };

      sinon.stub(UserService.prototype, 'listSystemUsers').resolves(mockUsers);
      sinon.stub(UserService.prototype, 'getSystemUsersCount').resolves(mockTotal);

      const requestHandler = users.getUserList();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockResponse);
    });
  });
});
