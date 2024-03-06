import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useXrefApi } from 'hooks/cb_api/useXrefApi';
import { v4 } from 'uuid';

describe('useXrefApi', () => {
  describe('getTaxonMeasurements', () => {
    let mock: MockAdapter;

    beforeEach(() => {
      mock = new MockAdapter(axios);
    });

    afterEach(() => {
      mock.restore();
    });

    const mockMeasurement = [
      {
        taxon_measurement_id: '29425067-e5ea-4284-b629-26c3cac4cbbf',
        taxon_id: '0db0129f-5969-4892-824d-459e5ac38dc2',
        measurement_name: 'Life Stage',
        measurement_desc: null,
        create_user: 'dab7cd7c-75af-474e-abbf-fd31ae166577',
        update_user: 'dab7cd7c-75af-474e-abbf-fd31ae166577',
        create_timestamp: '2023-07-25T18:18:27.933Z',
        update_timestamp: '2023-07-25T18:18:27.933Z'
      }
    ];

    it('should retrieve all possible measurements for a specific taxon', async () => {
      const taxon_id = v4();
      mock.onGet('/api/critterbase/xref/taxon-measurements?taxon_id=' + taxon_id).reply(200, mockMeasurement);
      const result = await useXrefApi(axios).getTaxonMeasurements(1);
      expect(Array.isArray(result)).toBe(true);
      expect(typeof result?.[0].taxon_measurement_id).toBe('string');
      expect(typeof result?.[0].measurement_name).toBe('string');
    });
  });
});
