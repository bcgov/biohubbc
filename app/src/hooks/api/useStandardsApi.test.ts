import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useStandardsApi from './useStandardsApi';

describe('useStandardsApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getSpeciesStandards', () => {
    it('works as expected', async () => {
      const mockTsn = 202422;
      const res = {
        scientificName: 'caribou',
        markingBodyLocations: [
          {
            value: 'left ear'
          }
        ],
        measurements: {
          quantitative: [{ measurement_name: 'body mass', measurement_desc: 'weight of the body' }],
          qualitative: [{ measurement_name: 'life stage', measurement_desc: 'age class of the individual' }]
        }
      };

      mock.onGet(`/api/standards/taxon/${mockTsn}`).reply(200, res);

      const result = await useStandardsApi(axios).getSpeciesStandards(mockTsn);

      expect(result.scientificName).toEqual('caribou');
      expect(result.markingBodyLocations[0].value).toEqual('left ear');
      expect(result.measurements.qualitative[0].measurement_name).toEqual('life stage');
      expect(result.measurements.quantitative[0].measurement_desc).toEqual('weight of the body');
    });
  });
});
