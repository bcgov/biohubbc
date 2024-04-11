import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { GET, getSpeciesStandards } from '.';
import * as db from '../../../../database/db';
import { CBMeasurementUnit } from '../../../../services/critterbase-service';
import { StandardsService } from '../../../../services/standards-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';

chai.use(sinonChai);

describe('standards/taxon/{tsn}', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((GET.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('getSpeciesStandards', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches a project', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const getSpeciesStandardsResult = {
        tsn: 420183,
        scientificName: 'caribou',
        marking_body_locations: [
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

      try {
        const requestHandler = getSpeciesStandards();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql(getSpeciesStandardsResult);
    });
  });
});
