import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ICbSelectRows, useLookupApi } from './useLookupApi';

describe('useLookupApi', () => {
  describe('getSelectOptions', () => {
    let mock: MockAdapter;

    beforeEach(() => {
      mock = new MockAdapter(axios);
    });

    afterEach(() => {
      mock.restore();
    });

    const mockLookup = [
      {
        key: 'colour_id',
        id: '7a516697-c7ee-43b3-9e17-2fc31572d819',
        value: 'Blue'
      },
      {
        key: 'colour_id',
        id: '9a516697-c7ee-43b3-9e17-2fc31572d819',
        value: 'Green'
      }
    ];

    const mockEnumLookup = ['A', 'B'];

    it('should return a lookup table in a format to be used by select components', async () => {
      mock.onGet('/api/critterbase/lookups/colours?format=asSelect').reply(200, mockLookup);
      const result = await useLookupApi(axios).getSelectOptions({ route: 'lookups/colours' });
      expect(Array.isArray(result)).toBe(true);
      expect(typeof result).not.toBe('string');
      const res = result as ICbSelectRows[];
      expect(res[0].key).toBe('colour_id');
      expect(res[0].value).toBe('Blue');
      expect(res[0].id).toBeDefined();
    });

    it('should order lookups by asc if param provided', async () => {
      mock.onGet('/api/critterbase/lookups/colours?format=asSelect').reply(200, mockLookup);
      const result = await useLookupApi(axios).getSelectOptions({ route: 'lookups/colours', orderBy: 'asc' });
      const res = result as ICbSelectRows[];
      expect(res[0].key).toBe('colour_id');
      expect(res[0].value).toBe('Blue');
      expect(res[0].id).toBeDefined();
      expect(res[1].key).toBe('colour_id');
      expect(res[1].value).toBe('Green');
      expect(res[1].id).toBeDefined();
    });

    it('should order string lookups by asc if param provided', async () => {
      mock.onGet('/api/critterbase/lookups/colours?format=asSelect').reply(200, mockEnumLookup);
      const result = await useLookupApi(axios).getSelectOptions({ route: 'lookups/colours', orderBy: 'asc' });
      const res = result as ICbSelectRows[];
      expect(res[0]).toBe('A');
      expect(res[1]).toBe('B');
    });

    it('should order string lookups by desc if param provided', async () => {
      mock.onGet('/api/critterbase/lookups/colours?format=asSelect').reply(200, mockEnumLookup);
      const result = await useLookupApi(axios).getSelectOptions({ route: 'lookups/colours', orderBy: 'desc' });
      const res = result as ICbSelectRows[];
      expect(res[0]).toBe('B');
      expect(res[1]).toBe('A');
    });

    it('should order lookups by desc if param provided', async () => {
      mock.onGet('/api/critterbase/lookups/colours?format=asSelect').reply(200, mockLookup);
      const result = await useLookupApi(axios).getSelectOptions({ route: 'lookups/colours', orderBy: 'desc' });
      const res = result as ICbSelectRows[];
      expect(res[0].key).toBe('colour_id');
      expect(res[0].value).toBe('Green');
      expect(res[0].id).toBeDefined();
      expect(res[1].key).toBe('colour_id');
      expect(res[1].value).toBe('Blue');
      expect(res[1].id).toBeDefined();
    });
  });
});
