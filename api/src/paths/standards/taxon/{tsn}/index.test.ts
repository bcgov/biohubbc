import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSpeciesStandards } from '.';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as db from '../../../../database/db';
import { CBMeasurementUnit } from '../../../../services/critterbase-service';
import { StandardsService } from '../../../../services/standards-service';

chai.use(sinonChai);

describe('standards/taxon/{tsn}', () => {
  describe('getSpeciesStandards', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('get standards for a species', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const getSpeciesStandardsResult = {
        tsn: 420183,
        scientificName: 'caribou',
        markingBodyLocations: [
          {
            id: '',
            key: '',
            value: 'left ear'
          }
        ],
        measurements: {
          quantitative: [
            {
              itis_tsn: 420183,
              taxon_measurement_id: '',
              min_value: 1,
              max_value: 10,
              measurement_name: 'body mass',
              measurement_desc: 'weight of the body',
              unit: 'kilogram' as CBMeasurementUnit
            }
          ],
          qualitative: [
            {
              itis_tsn: 420183,
              taxon_measurement_id: '',
              measurement_name: 'life stage',
              measurement_desc: 'age class of the individual',
              options: []
            }
          ]
        }
      };

      sinon.stub(StandardsService.prototype, 'getSpeciesStandards').resolves(getSpeciesStandardsResult);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
      mockReq.params = { tsn: '123456' };

      const requestHandler = getSpeciesStandards();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql(getSpeciesStandardsResult);
    });
  });
});
