import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useTaxonomyApi from './useTaxonomyApi';

describe('useTaxonomyApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getSpeciesFromIds works as expected', async () => {
    const res = [
      {
        tsn: '1',
        commonName: 'something',
        scientificName: 'something'
      },
      {
        tsn: '2',
        commonName: 'anything',
        scientificName: 'anything'
      }
    ];

    mock.onGet('/api/taxonomy/species/list').reply(200, res);

    const result = await useTaxonomyApi(axios).getSpeciesFromIds([1, 2]);

    expect(result).toEqual(res);
  });
});
