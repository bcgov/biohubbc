import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import useFundingSourceApi from './useFundingSourceApi';

describe('useFundingSourceApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('getAllFundingSources', () => {
    it('works as expected', async () => {
      const res: IGetFundingSourcesResponse[] = [
        {
          funding_source_id: 1,
          name: 'name',
          description: 'description'
        }
      ];

      mock.onGet('/api/funding-sources').reply(200, res);

      const result = await useFundingSourceApi(axios).getAllFundingSources();

      expect(result).toEql(res);
    });
  });

  describe('getFundingSourceById', () => {
    it('works as expected', async () => {
      // TODO
    });
  });

  describe('postFundingSource', () => {
    it('works as expected', async () => {
      // TODO
    });
  });

  describe('deleteFundingSourceById', () => {
    it('works as expected', async () => {
      // TODO
    });
  });

  describe('putFundingSourceById', () => {
    it('works as expected', async () => {
      // TODO
    });
  });
});
