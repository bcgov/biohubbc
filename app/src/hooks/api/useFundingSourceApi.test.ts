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
          description: 'description',
          start_date: null,
          end_date: null,
          revision_count: 0,
          survey_reference_count: 1,
          survey_reference_amount_total: 1000
        }
      ];

      mock.onGet('/api/funding-sources').reply(200, res);

      const result = await useFundingSourceApi(axios).getAllFundingSources();

      expect(result).toEqual(res);
    });
  });

  describe('getFundingSource', () => {
    it('works as expected', async () => {
      mock.onGet('/api/funding-sources/1').reply(200, {
        funding_source_id: 1,
        name: 'Some Name',
        description: 'Some Description',
        start_date: null,
        end_date: null,
        revision_count: 1
      });

      const result = await useFundingSourceApi(axios).getFundingSource(1);
      expect(result).toEqual({
        funding_source_id: 1,
        name: 'Some Name',
        description: 'Some Description',
        start_date: null,
        end_date: null,
        revision_count: 1
      });
    });
  });

  describe('postFundingSource', () => {
    it('works as expected', async () => {
      const putObject = {
        funding_source_id: 1,
        name: 'Some Name',
        description: 'Some Description',
        start_date: null,
        end_date: null,
        revision_count: 1
      };
      mock.onPost('/api/funding-sources').reply(200, [
        {
          funding_source_id: 1,
          name: 'Some Name',
          description: 'Some Description',
          start_date: null,
          end_date: null,
          revision_count: 1
        }
      ]);

      const result = await useFundingSourceApi(axios).postFundingSource(putObject);
      expect(result).toEqual([putObject]);
    });
  });

  describe('deleteFundingSourceById', () => {
    it('works as expected', async () => {
      mock.onDelete('/api/funding-sources/1').reply(200, { funding_source_id: 1 });

      const result = await useFundingSourceApi(axios).deleteFundingSourceById(1);
      expect(result).toEqual({ funding_source_id: 1 });
    });
  });

  describe('putFundingSourceById', () => {
    it('works as expected', async () => {
      const putObject = {
        funding_source_id: 1,
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        revision_count: 1
      };
      mock.onPut('/api/funding-sources/1').reply(200, { funding_source_id: 1 });

      const result = await useFundingSourceApi(axios).putFundingSource(putObject);
      expect(result).toEqual({ funding_source_id: 1 });
    });
  });
});
