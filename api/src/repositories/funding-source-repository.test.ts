import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { ICreateFundingSource } from '../services/funding-source-service';
import { getMockDBConnection } from '../__mocks__/db';
import { FundingSource, FundingSourceRepository, SurveyFundingSource } from './funding-source-repository';

chai.use(sinonChai);

describe('FundingSourceRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getFundingSources', () => {
    it('returns an empty array of funding source items', async () => {
      const expectedResult: FundingSource[] = [];

      const mockResponse = { rowCount: 1, rows: expectedResult } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ knex: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.getFundingSources({ name: 'mame' });

      expect(response).to.eql(expectedResult);
    });

    it('returns a non empty array of funding source items', async () => {
      const expectedResult: FundingSource[] = [
        {
          funding_source_id: 1,
          name: 'name',
          start_date: '2020-01-01',
          end_date: '2020-01-01',
          description: 'description'
        }
      ];

      const mockResponse = { rowCount: 1, rows: expectedResult } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ knex: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.getFundingSources({ name: 'mame' });

      expect(response).to.eql(expectedResult);
    });
  });

  describe('hasFundingSourceNameBeenUsed', () => {
    it('returns true if name exists', async () => {
      const mockResponse = { rowCount: 1, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.hasFundingSourceNameBeenUsed('name');

      expect(response).to.eql(true);
    });

    it('returns false if name doesnt exists', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.hasFundingSourceNameBeenUsed('name');

      expect(response).to.eql(false);
    });
  });

  describe('postFundingSource', () => {
    it('returns funding_source_id if inserted', async () => {
      const fundingSourceInput: ICreateFundingSource = {
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description'
      };

      const mockResponse = { rowCount: 1, rows: [{ funding_source_id: 1 }] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.postFundingSource(fundingSourceInput);

      expect(response).to.eql({ funding_source_id: 1 });
    });

    it('throws an error if insert fails', async () => {
      const fundingSourceInput: ICreateFundingSource = {
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description'
      };

      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      try {
        await fundingSourceRepository.postFundingSource(fundingSourceInput);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to insert Funding Source record');
      }
    });
  });

  describe('getFundingSource', () => {
    it('returns a single funding source', async () => {
      const expectedResult: FundingSource = {
        funding_source_id: 1,
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description'
      };

      const mockResponse = { rowCount: 1, rows: [expectedResult] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      const response = await fundingSourceRepository.getFundingSource(fundingSourceId);

      expect(response).to.eql(expectedResult);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      try {
        await fundingSourceRepository.getFundingSource(fundingSourceId);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get funding source');
      }
    });

    it('throws an error if rowCount is greater than 1', async () => {
      const mockResponse = { rowCount: 2, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      try {
        await fundingSourceRepository.getFundingSource(fundingSourceId);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get funding source');
      }
    });
  });

  describe('getFundingSourceSurveyReferences', () => {
    it('returns an array of funding sources with reference', async () => {
      const expectedResult: SurveyFundingSource = {
        funding_source_id: 1,
        funding_source_name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description'
      } as unknown as SurveyFundingSource;

      const mockResponse = { rowCount: 1, rows: [expectedResult] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      const response = await fundingSourceRepository.getFundingSourceSurveyReferences(fundingSourceId);

      expect(response).to.eql([expectedResult]);
    });
  });

  describe('putFundingSource', () => {
    it('returns a single funding source', async () => {
      const fundingSourceId = 1;
      const expectedResult = { funding_source_id: fundingSourceId };

      const mockResponse = { rowCount: 1, rows: [expectedResult] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSource: FundingSource = {
        funding_source_id: fundingSourceId,
        name: 'name',
        description: 'description',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        revision_count: 0
      };

      const response = await fundingSourceRepository.putFundingSource(fundingSource);

      expect(response).to.eql(expectedResult);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;
      const fundingSource: FundingSource = {
        funding_source_id: fundingSourceId,
        name: 'name',
        description: 'description',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
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
      const mockResponse = { rowCount: 2, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;
      const fundingSource: FundingSource = {
        funding_source_id: fundingSourceId,
        name: 'name',
        description: 'description',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
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

  describe('deleteFundingSource', () => {
    it('deletes a single funding source', async () => {
      const expectedResult = { funding_source_id: 1 };

      const mockResponse = { rowCount: 1, rows: [expectedResult] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      const response = await fundingSourceRepository.deleteFundingSource(fundingSourceId);

      expect(response).to.eql(expectedResult);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      try {
        await fundingSourceRepository.deleteFundingSource(fundingSourceId);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to delete funding source');
      }
    });

    it('throws an error if rowCount is greater than 1', async () => {
      const mockResponse = { rowCount: 2, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      try {
        await fundingSourceRepository.deleteFundingSource(fundingSourceId);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to delete funding source');
      }
    });
  });

  describe('getFundingSourceSupplementaryData', () => {
    it('returns a single funding source basic supplementary data', async () => {
      const expectedResult = { survey_reference_count: 1, survey_reference_amount_total: 1 };

      const mockResponse = { rowCount: 1, rows: [expectedResult] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      const response = await fundingSourceRepository.getFundingSourceSupplementaryData(fundingSourceId);

      expect(response).to.eql(expectedResult);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const fundingSourceId = 1;

      try {
        await fundingSourceRepository.getFundingSourceSupplementaryData(fundingSourceId);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get funding source basic supplementary data');
      }
    });
  });

  describe('getSurveyFundingSources', () => {
    it('returns all survey funding sources', async () => {
      const expectedResult = [
        {
          survey_funding_source_id: 1,
          survey_id: 1,
          funding_source_id: 1,
          amount: 1,
          revision_count: 1
        }
      ];

      const mockResponse = { rowCount: 1, rows: expectedResult } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.getSurveyFundingSources(1);

      expect(response).to.eql(expectedResult);
    });
  });

  describe('postSurveyFundingSource', () => {
    it('inserts new survey fundng source', async () => {
      const mockResponse = { rowCount: 1, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.postSurveyFundingSource(1, 1, 100);

      expect(response).to.eql(undefined);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      try {
        await fundingSourceRepository.postSurveyFundingSource(1, 1, 100);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to insert survey funding source');
      }
    });
  });

  describe('putSurveyFundingSource', () => {
    it('updates survey funding source', async () => {
      const mockResponse = { rowCount: 1, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.putSurveyFundingSource(1, 1, 100, 1);

      expect(response).to.eql(undefined);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      try {
        await fundingSourceRepository.putSurveyFundingSource(1, 1, 100, 1);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to update survey funding source');
      }
    });
  });

  describe('deleteSurveyFundingSource', () => {
    it('deletes survey funding source', async () => {
      const mockResponse = { rowCount: 1, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      const response = await fundingSourceRepository.deleteSurveyFundingSource(1, 1);

      expect(response).to.eql(undefined);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rowCount: 0, rows: [] } as unknown as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({ sql: async () => mockResponse });

      const fundingSourceRepository = new FundingSourceRepository(dbConnection);

      try {
        await fundingSourceRepository.deleteSurveyFundingSource(1, 1);

        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to delete survey funding source');
      }
    });
  });
});
