import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { DraftService } from '../../services/draft-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as list from './list';

chai.use(sinonChai);

describe('paths/draft/list', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((list.GET.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('getDraftList', () => {
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
      sinon.stub(DraftService.prototype, 'getDraftList').rejects(expectedError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = list.getDraftList();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });

    it('should succeed with valid data', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      sinon.stub(DraftService.prototype, 'getDraftList').resolves([
        {
          webform_draft_id: 1,
          name: 'draft object 1',
          data: {},
          create_date: '2022-10-10',
          update_date: null
        },
        {
          webform_draft_id: 2,
          name: 'draft object 2',
          data: {},
          create_date: '2022-10-10',
          update_date: '2022-10-11'
        }
      ]);

      const requestHandler = list.getDraftList();

      await requestHandler(mockReq, mockRes, mockNext);
      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql([
        {
          webform_draft_id: 1,
          name: 'draft object 1',
          data: {},
          create_date: '2022-10-10',
          update_date: null
        },
        {
          webform_draft_id: 2,
          name: 'draft object 2',
          data: {},
          create_date: '2022-10-10',
          update_date: '2022-10-11'
        }
      ]);
    });
  });
});
