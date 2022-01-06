import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import * as authorization from '../../../request-handlers/security/authorization';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as user from './get';

chai.use(sinonChai);

describe('user', () => {
  describe('getUserById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no user Id is sent', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: ''
      };

      try {
        const requestHandler = user.getUserById();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param: userId');
      }
    });

    it('should throw a 400 error if it fails to get the system user', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      sinon.stub(authorization, 'getSystemUserById').resolves(null);

      try {
        const requestHandler = user.getUserById();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to get system user');
      }
    });

    it('finds user by Id and returns 200 and requestHandler on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      sinon.stub(authorization, 'getSystemUserById').resolves({
        id: 1,
        uis_id: 'uis_id',
        user_identifier: 'user_identifier',
        record_effective_date: null
      });

      const requestHandler = user.getUserById();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql({
        id: 1,
        uis_id: 'uis_id',
        user_identifier: 'user_identifier',
        record_effective_date: null
      });
    });
  });
});
