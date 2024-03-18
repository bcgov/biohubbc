import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useXrefApi } from 'hooks/cb_api/useXrefApi';

describe('useXrefApi', () => {
  describe('getTaxonMeasurements', () => {
    let mock: MockAdapter;

    beforeEach(() => {
      mock = new MockAdapter(axios);
    });

    afterEach(() => {
      mock.restore();
    });

    const mockMeasurements = {
      qualitative: [],
      quantitative: []
    };

    it('should retrieve all possible measurements for a specific taxon', async () => {
      mock.onGet(`/api/critterbase/xref/taxon-measurements?tsn=1`).reply(200, mockMeasurements);
      const result: any = await useXrefApi(axios).getTaxonMeasurements(1);
      expect(Array.isArray(result?.quantitative)).toBe(true);
      expect(Array.isArray(result?.qualitative)).toBe(true);
    });
  });
});
