import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { PlatformService } from '../../../services/platform-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { GET, getTaxonomyByTsns } from './list';

chai.use(sinonChai);

describe('list', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((GET.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('getTaxonomyByTsns', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns an empty array if no species tsn are found', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const getTaxonomyByTsnsStub = sinon.stub(PlatformService.prototype, 'getTaxonomyByTsns').resolves([]);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.query = {
        tsn: ''
      };

      const requestHandler = getTaxonomyByTsns();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(getTaxonomyByTsnsStub).to.have.been.calledWith([]);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql({ searchResponse: [] });
    });

    it('returns an array of species', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const mock1 = ({ tsn: '1', commonName: 'something', scientificName: 'scientificName' } as unknown) as any;
      const mock2 = ({ tsn: '2', commonName: 'anything', scientificName: 'scientificName' } as unknown) as any;

      const getTaxonomyByTsnsStub = sinon.stub(PlatformService.prototype, 'getTaxonomyByTsns').resolves([mock1, mock2]);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.query = {
        tsn: '0=1&1=2'
      };

      const requestHandler = getTaxonomyByTsns();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(getTaxonomyByTsnsStub).to.have.been.calledWith(['1', '2']);

      expect(mockRes.jsonValue).to.eql({ searchResponse: [mock1, mock2] });
      expect(mockRes.statusValue).to.equal(200);
    });

    it('catches error, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(PlatformService.prototype, 'getTaxonomyByTsns').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.query = {
        tsn: '0=1&1=2'
      };

      try {
        const requestHandler = getTaxonomyByTsns();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
