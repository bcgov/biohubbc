import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useXrefApi } from 'hooks/cb_api/useXrefApi';
import { CBMeasurementSearchByTsnResponse } from 'interfaces/useCritterApi.interface';

describe('useXrefApi', () => {
  describe('getTaxonMeasurements', () => {
    let mock: MockAdapter;

    beforeEach(() => {
      mock = new MockAdapter(axios);
    });

    afterEach(() => {
      mock.restore();
    });

    const mockResponse: CBMeasurementSearchByTsnResponse = {
      qualitative: [
        {
          itis_tsn: 1234,
          taxon_measurement_id: '1234',
          measurement_desc: 'test',
          measurement_name: 'test',
          options: [
            {
              option_desc: 'test',
              option_label: 'test',
              option_value: 1,
              qualitative_option_id: '1',
              taxon_measurement_id: '1234'
            }
          ]
        }
      ],
      quantitative: [
        {
          itis_tsn: 1234,
          taxon_measurement_id: '1234',
          measurement_desc: 'test',
          measurement_name: 'test',
          min_value: 1,
          max_value: 2,
          unit: 'centimeter'
        }
      ]
    };

    it('should retrieve all possible measurements for a specific taxon', async () => {
      const itis_tsn = 1234;
      mock.onGet(`/api/critterbase/xref/taxon-measurements?tsn=${itis_tsn}`).reply(200, mockResponse);

      const result = await useXrefApi(axios).getTaxonMeasurements(itis_tsn);

      expect(result).toEqual(mockResponse);
    });
  });
});
