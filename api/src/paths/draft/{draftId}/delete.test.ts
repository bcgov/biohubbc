import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { DraftService } from '../../../services/draft-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as endpoint from './delete';

chai.use(sinonChai);

describe('paths/draft/{draftId}/delete', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((endpoint.DELETE.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('deleteDraft', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when a failure occurs', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      const expectedError = new Error('cannot process request');
      sinon.stub(DraftService.prototype, 'deleteDraft').rejects(expectedError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = endpoint.deleteDraft();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });

    it('deletes a draft', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      sinon.stub(DraftService.prototype, 'deleteDraft').resolves({ webform_draft_id: 1 });

      const requestHandler = endpoint.deleteDraft();
      mockReq.params = { draftId: '1' };

      await requestHandler(mockReq, mockRes, mockNext);
      expect(mockRes.statusValue).to.equal(200);
    });
  });
});
