import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { UserService } from '../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as user from './get';

chai.use(sinonChai);

describe('user', () => {
  describe('getUserById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('catches and re-throws an error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      sinon.stub(UserService.prototype, 'getUserById').rejects(new Error('test error'));

      try {
        const requestHandler = user.getUserById();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as Error).message).to.equal('test error');
        expect(dbConnectionObj.release).to.have.been.calledOnce;
        expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      }
    });

    it('finds user by Id and returns 200 and requestHandler on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      sinon.stub(UserService.prototype, 'getUserById').resolves({
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
      });

      const requestHandler = user.getUserById();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql({
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
      });
    });
  });
});
