import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
import { TaxonomyService } from '../../../services/taxonomy-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { GET, getSpeciesFromIds } from './list';

chai.use(sinonChai);

describe('list', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((GET.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('getSpeciesFromIds', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns an empty array if no species ids are found', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const getSpeciesFromIdsStub = sinon.stub(TaxonomyService.prototype, 'getSpeciesFromIds').resolves([]);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.query = {
        ids: ''
      };

      const requestHandler = getSpeciesFromIds();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(getSpeciesFromIdsStub).to.have.been.calledWith([]);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql({ searchResponse: [] });
    });

    it('returns an array of species', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const mock1 = ({ id: '1', label: 'something' } as unknown) as any;
      const mock2 = ({ id: '2', label: 'anything' } as unknown) as any;

      const getSpeciesFromIdsStub = sinon.stub(TaxonomyService.prototype, 'getSpeciesFromIds').resolves([mock1, mock2]);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.query = {
        ids: '0=1&1=2'
      };

      const requestHandler = getSpeciesFromIds();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(getSpeciesFromIdsStub).to.have.been.calledWith(['1', '2']);

      expect(mockRes.jsonValue).to.eql({ searchResponse: [mock1, mock2] });
      expect(mockRes.statusValue).to.equal(200);
    });

    it('catches error, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(TaxonomyService.prototype, 'getSpeciesFromIds').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.query = {
        ids: '0=1&1=2'
      };

      try {
        const requestHandler = getSpeciesFromIds();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
