import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { HTTPError } from '../errors/http-error';
import { CodeService } from '../services/code-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import * as codes from './codes';

chai.use(sinonChai);

describe('codes', () => {
  describe('getAllCodes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 500 error when fails to fetch codes', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);

      sinon.stub(CodeService.prototype, 'getAllCodeSets').resolves(undefined);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.keycloak_token = {};

      try {
        const requestHandler = codes.getAllCodes();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(500);
        expect((actualError as HTTPError).message).to.equal('Failed to fetch codes');
      }
    });

    it('should return the fetched codes on success', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);

      sinon.stub(CodeService.prototype, 'getAllCodeSets').resolves({
        management_action_type: { id: 1, name: 'management action type' }
      } as any);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.keycloak_token = {};

      const requestHandler = codes.getAllCodes();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue.management_action_type).to.eql({ id: 1, name: 'management action type' });
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process request');

      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);

      sinon.stub(CodeService.prototype, 'getAllCodeSets').rejects(expectedError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.keycloak_token = {};

      try {
        const requestHandler = codes.getAllCodes();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });
  });
});
