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

  it('searchSpecies works as expected', async () => {
    const res = [
      {
        id: '1',
        label: 'something'
      },
      {
        id: '2',
        label: 'anything'
      }
    ];

    mock.onGet('/api/taxonomy/species/search').reply(200, res);

    const result = await useTaxonomyApi(axios).searchSpecies('th');

    expect(result).toEqual(res);
  });

  it('getSpeciesFromIds works as expected', async () => {
    const res = [
      {
        id: '1',
        label: 'something'
      },
      {
        id: '2',
        label: 'anything'
      }
    ];

    mock.onGet('/api/taxonomy/species/list').reply(200, res);

    const result = await useTaxonomyApi(axios).getSpeciesFromIds([1, 2]);

    expect(result).toEqual(res);
  });
});
