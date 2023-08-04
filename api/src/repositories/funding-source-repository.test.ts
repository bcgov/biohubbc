import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { FundingSource, FundingSourceRepository } from './funding-source-repository';

chai.use(sinonChai);

describe('FundingSourceRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getFundingSources', () => {
    it('returns an empty array of funding source items', async () => {
      const mockFundingSources: FundingSource[] = [];

      const mockResponse = ({ rowCount: 0, rows: mockFundingSources } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.getFundingSources();

      expect(response).to.eql(mockFundingSources);
    });

    it('returns a non empty array of funding source items', async () => {
      const mockFundingSources: FundingSource[] = [{ funding_source_id: 1, name: 'name', description: 'description' }];

      const mockResponse = ({ rowCount: 1, rows: mockFundingSources } as unknown) as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.getFundingSources();

      expect(response).to.eql(mockFundingSources);
    });
  });
});
