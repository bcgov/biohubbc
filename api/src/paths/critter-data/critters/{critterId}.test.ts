import Ajv from 'ajv';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import * as critter from './{critterId}';

chai.use(sinonChai);

describe('paths/critter-data/critters/{critterId}', () => {
  const ajv = new Ajv();

  it('is valid openapi v3 schema', () => {
    expect(ajv.validateSchema((critter.GET.apiDoc as unknown) as object)).to.be.true;
  });

  const mockCritter = {
    critter_id: 'asdf',
    wlh_id: '17-10748',
    animal_id: '6',
    sex: 'Female',
    taxon: 'Caribou',
    collection_units: [
      {
        category_name: 'Population Unit',
        unit_name: 'Itcha-Ilgachuz',
        collection_unit_id: '0284c4ca-a279-4135-b6ef-d8f4f8c3d1e6',
        collection_category_id: '9dcf05a8-9bfe-421b-b487-ce65299441ca'
      }
    ],
    mortality_timestamp: new Date()
  };

  describe('getCritter', async () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should succeed', async () => {
      const mockGetCritter = sinon.stub(CritterbaseService.prototype, 'getCritter').resolves(mockCritter);
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { critterId: 'asdf' };
      const requestHandler = critter.getCritter();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockGetCritter.calledOnce).to.be.true;
      expect(mockGetCritter).calledWith('asdf');
      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.json.calledWith(mockCritter)).to.be.true;
    });
    it('should fail', async () => {
      const mockError = new Error('mock error');
      const mockGetCritter = sinon.stub(CritterbaseService.prototype, 'getCritter').rejects(mockError);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      const requestHandler = critter.getCritter();

      try {
        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(actualError).to.equal(mockError);
        expect(mockGetCritter.calledOnce).to.be.true;
      }
    });
  });
});
