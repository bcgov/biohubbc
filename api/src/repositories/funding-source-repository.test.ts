import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { FundingSource, FundingSourceRepository } from './funding-source-repository';

chai.use(sinonChai);

describe('FundingSourceRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getFundingSources', () => {
    it('returns an empty array of funding source items', async () => {
      const expectedResult: FundingSource[] = [];

      const mockResponse = ({ rowCount: 1, rows: expectedResult } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.getFundingSources();

      expect(response).to.eql(expectedResult);
    });

    it('returns a non empty array of funding source items', async () => {
      const expectedResult: FundingSource[] = [{ funding_source_id: 1, name: 'name', description: 'description' }];

      const mockResponse = ({ rowCount: 1, rows: expectedResult } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.getFundingSources();

      expect(response).to.eql(expectedResult);
    });
  });

  describe('getFundingSourceById', () => {
    it('returns a single funding source', async () => {
      const expectedResult: FundingSource = {
        funding_source_id: 1,
        name: 'name',
        description: 'description'
      };

      const mockResponse = ({ rowCount: 1, rows: [expectedResult] } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      const response = await fundingSourceRepository.getFundingSourceById(fundingSourceId);

      expect(response).to.eql(expectedResult);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = ({ rowCount: 0, rows: [] } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      try {
        await fundingSourceRepository.getFundingSourceById(fundingSourceId);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get funding source');
      }
    });

    it('throws an error if rowCount is greater than 1', async () => {
      const mockResponse = ({ rowCount: 2, rows: [] } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      try {
        await fundingSourceRepository.getFundingSourceById(fundingSourceId);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get funding source');
      }
    });
  });

  describe('putFundingSource', () => {
    it('returns a single funding source', async () => {
      const fundingSourceId = 1;
      const expectedResult = { funding_source_id: fundingSourceId };

      const mockResponse = ({ rowCount: 1, rows: [expectedResult] } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSource: FundingSource = {
        funding_source_id: fundingSourceId,
        name: 'name',
        description: 'description',
        revision_count: 0
      };

      const response = await fundingSourceRepository.putFundingSource(fundingSource);

      expect(response).to.eql(expectedResult);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = ({ rowCount: 0, rows: [] } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;
      const fundingSource: FundingSource = {
        funding_source_id: fundingSourceId,
        name: 'name',
        description: 'description',
        revision_count: 0
      };

      try {
        await fundingSourceRepository.putFundingSource(fundingSource);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to update funding source');
      }
    });

    it('throws an error if rowCount is greater than 1', async () => {
      const mockResponse = ({ rowCount: 2, rows: [] } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;
      const fundingSource: FundingSource = {
        funding_source_id: fundingSourceId,
        name: 'name',
        description: 'description',
        revision_count: 0
      };

      try {
        await fundingSourceRepository.putFundingSource(fundingSource);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to update funding source');
      }
    });
  });
});
