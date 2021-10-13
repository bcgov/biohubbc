import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useSearchApi, { usePublicSearchApi } from './useSearchApi';

describe('useSearchApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getSearchResults works as expected', async () => {
    const res = [
      {
        id: '1',
        name: 'name',
        objectives: 'objectives',
        geometry: []
      }
    ];

    mock.onGet('api/search').reply(200, res);

    const result = await useSearchApi(axios).getSearchResults();

    expect(result[0].id).toEqual('1');
  });
});

describe('usePublicSearchApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getSearchResults works as expected', async () => {
    const res = [
      {
        id: '1',
        name: 'name',
        objectives: 'objectives',
        geometry: []
      }
    ];

    mock.onGet('api/public/search').reply(200, res);

    const result = await usePublicSearchApi(axios).getSearchResults();

    expect(result[0].id).toEqual('1');
  });
});
