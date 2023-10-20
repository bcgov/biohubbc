import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { v4 } from 'uuid';
import { ICbSelectRows, useLookupApi } from './useLookupApi';

describe('useLookup', () => {
  let mock: any;

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
    }
  ];

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

  it('should return a lookup table in a format to be used by select components', async () => {
    mock.onGet('/api/critter-data/lookups/colours?format=asSelect').reply(200, mockLookup);
    const result = await useLookupApi(axios).getSelectOptions({ route: 'lookups/colours' });
    expect(Array.isArray(result)).toBe(true);
    expect(typeof result).not.toBe('string');
    const res = result as ICbSelectRows[];
    expect(res[0].key).toBe('colour_id');
    expect(res[0].value).toBe('Blue');
    expect(res[0].id).toBeDefined();
  });

  it('should retrieve all possible measurements for a specific taxon', async () => {
    const taxon_id = v4();
    mock.onGet('/api/critter-data/xref/taxon-measurements?taxon_id=' + taxon_id).reply(200, mockMeasurement);
    const result = await useLookupApi(axios).getTaxonMeasurements(taxon_id);
    expect(Array.isArray(result)).toBe(true);
    expect(typeof result?.[0].taxon_measurement_id).toBe('string');
    expect(typeof result?.[0].measurement_name).toBe('string');
  });
});
