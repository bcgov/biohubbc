import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { DraftService } from '../../services/draft-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as create from './create';

chai.use(sinonChai);

describe('paths/draft/create', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((create.POST.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('createDraft', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no system user id', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
        const requestHandler = create.createDraft();

        await requestHandler(mockReq, mockRes, mockNext);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
      }
    });

    it('creates a new draft', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      sinon.stub(DraftService.prototype, 'createDraft').resolves({
        webform_draft_id: 1,
        name: 'draft object',
        data: {},
        create_date: '2022-10-10',
        update_date: null
      });
      const requestHandler = create.createDraft();

      mockReq.body = { name: 'draft name', data: { a: '1', b: '2' } };

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql({
        webform_draft_id: 1,
        name: 'draft object',
        data: {},
        create_date: '2022-10-10',
        update_date: null
      });
    });
  });
});
