import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import {
  SiteSelectionStrategyRepository,
  SurveyStratum,
  SurveyStratumDetails,
  SurveyStratumRecord
} from './site-selection-strategy-repository';

chai.use(sinonChai);

describe('SiteSelectionStrategyRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSiteSelectionDataBySurveyId', () => {
    it('should return non-empty data', async () => {
      const mockStrategiesRows: { name: string }[] = [{ name: 'strategy1' }, { name: 'strategy2' }];
      const mockStrategiesResponse = { rows: mockStrategiesRows, rowCount: 2 } as any as Promise<QueryResult<any>>;

      const mockStratumsRows: SurveyStratumDetails[] = [
        {
          name: 'stratum1',
          description: '',
          survey_id: 1,
          survey_stratum_id: 2,
          revision_count: 0,
          sample_stratum_count: 1
        },
        {
          name: 'stratum2',
          description: '',
          survey_id: 1,
          survey_stratum_id: 2,
          revision_count: 0,
          sample_stratum_count: 1
        }
      ];
      const mockStratumsResponse = { rows: mockStratumsRows, rowCount: 2 } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({
        knex: sinon.stub().onFirstCall().resolves(mockStrategiesResponse).onSecondCall().resolves(mockStratumsResponse)
      });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;

      const response = await repo.getSiteSelectionDataBySurveyId(surveyId);

      expect(dbConnectionObj.knex).to.have.been.calledTwice;
      expect(response).to.eql({ strategies: ['strategy1', 'strategy2'], stratums: mockStratumsRows });
    });

    it('should return empty data', async () => {
      const mockStrategiesRows: { name: string }[] = [];
      const mockStrategiesResponse = { rows: mockStrategiesRows, rowCount: 0 } as any as Promise<QueryResult<any>>;

      const mockStratumsRows: SurveyStratumDetails[] = [];
      const mockStratumsResponse = { rows: mockStratumsRows, rowCount: 0 } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({
        knex: sinon.stub().onFirstCall().resolves(mockStrategiesResponse).onSecondCall().resolves(mockStratumsResponse)
      });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;

      const response = await repo.getSiteSelectionDataBySurveyId(surveyId);

      expect(dbConnectionObj.knex).to.have.been.calledTwice;
      expect(response).to.eql({ strategies: [], stratums: mockStratumsRows });
    });
  });

  describe('deleteSurveySiteSelectionStrategies', () => {
    it('should return non-zero rowCount', async () => {
      const mockRows: any[] = [{}];
      const rowCount = 1;
      const mockResponse = { rows: mockRows, rowCount: rowCount } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;

      const response = await repo.deleteSurveySiteSelectionStrategies(surveyId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.equal(rowCount);
    });

    it('should return zero rowCount', async () => {
      const mockRows: any[] = [];
      const rowCount = 0;
      const mockResponse = { rows: mockRows, rowCount: rowCount } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;

      const response = await repo.deleteSurveySiteSelectionStrategies(surveyId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.equal(rowCount);
    });
  });

  describe('insertSurveySiteSelectionStrategies', () => {
    it('should insert a record and return a single row', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = { rows: mockRows, rowCount: 2 } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;
      const strategies: string[] = ['strategy1', 'strategy2'];

      const response = await repo.insertSurveySiteSelectionStrategies(surveyId, strategies);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.be.undefined;
    });

    it('throws an error if rowCount does not equal strategies length', async () => {
      const mockRows: any[] = [{}];
      const mockResponse = { rows: mockRows, rowCount: 1 } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;

      // strategies length = 2, rowCount = 1
      const strategies: string[] = ['strategy1', 'strategy2'];

      try {
        await repo.insertSurveySiteSelectionStrategies(surveyId, strategies);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert survey site selection strategies');
      }
    });
  });

  describe('deleteSurveyStratums', () => {
    it('should delete records and return non-zero rowCount', async () => {
      const mockRows: any[] = [];
      const rowCount = 3;
      const mockResponse = { rows: mockRows, rowCount: rowCount } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const stratumIds = [1, 2, 3];

      const response = await repo.deleteSurveyStratums(stratumIds);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql(rowCount);
    });

    it('should delete records and return zero rowCount', async () => {
      const mockRows: any[] = [];
      const rowCount = 0;
      const mockResponse = { rows: mockRows, rowCount: rowCount } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const stratumIds: number[] = [];

      const response = await repo.deleteSurveyStratums(stratumIds);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql(rowCount);
    });
  });

  describe('insertSurveyStratums', () => {
    it('should insert records and return rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = { rows: mockRows, rowCount: 2 } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;
      const stratums: SurveyStratum[] = [
        { name: 'stratum1', description: '' },
        { name: 'stratum2', description: '' }
      ];

      const response = await repo.insertSurveyStratums(surveyId, stratums);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('throws an error if rowCount does not equal stratums length', async () => {
      const mockRows: any[] = [{}];
      const rowCount = 1;
      const mockResponse = { rows: mockRows, rowCount: rowCount } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;

      // stratums length = 2, rowCount = 1
      const stratums: SurveyStratum[] = [
        { name: 'stratum1', description: '' },
        { name: 'stratum2', description: '' }
      ];

      try {
        await repo.insertSurveyStratums(surveyId, stratums);
      } catch (error) {
        expect(dbConnectionObj.knex).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert survey stratums');
      }
    });
  });

  describe('updateSurveyStratums', () => {
    it('should insert records and return rows', async () => {
      const mockRows1: SurveyStratumRecord[] = [
        {
          name: 'stratum1',
          description: '',
          survey_id: 1,
          survey_stratum_id: 1,
          revision_count: 1,
        }
      ];
      const mockRows2: SurveyStratumRecord[] = [
        {
          name: 'stratum1',
          description: '',
          survey_id: 1,
          survey_stratum_id: 2,
          revision_count: 1,
        }
      ];
      const mockResponse1 = { rows: mockRows1, rowCount: 1 } as any as Promise<QueryResult<any>>;
      const mockResponse2 = { rows: mockRows2, rowCount: 1 } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({
        knex: sinon.stub().onFirstCall().resolves(mockResponse1).onSecondCall().resolves(mockResponse2)
      });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;
      const stratums: SurveyStratumRecord[] = [
        { name: 'stratum1', description: '', survey_id: 1, survey_stratum_id: 1, revision_count: 0 },
        { name: 'stratum1', description: '', survey_id: 1, survey_stratum_id: 2, revision_count: 0 }
      ];

      const response = await repo.updateSurveyStratums(surveyId, stratums);

      expect(dbConnectionObj.knex).to.have.been.calledTwice;
      expect(response).to.eql([...mockRows1, ...mockRows2]);
    });

    it('throws an error if rowCount does not equal stratums length', async () => {
      const mockRows1: SurveyStratumRecord[] = [
        {
          name: 'stratum1',
          description: '',
          survey_id: 1,
          survey_stratum_id: 1,
          revision_count: 1,
        }
      ];
      const mockResponse1 = { rows: mockRows1, rowCount: 1 } as any as Promise<QueryResult<any>>;
      const mockResponse2 = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;

      const dbConnectionObj = getMockDBConnection({
        knex: sinon.stub().onFirstCall().resolves(mockResponse1).onSecondCall().resolves(mockResponse2)
      });

      const repo = new SiteSelectionStrategyRepository(dbConnectionObj);

      const surveyId = 1;

      // stratums length = 2, total rowCount = 1
      const stratums: SurveyStratumRecord[] = [
        { name: 'stratum1', description: '', survey_id: 1, survey_stratum_id: 1, revision_count: 0 },
        { name: 'stratum1', description: '', survey_id: 1, survey_stratum_id: 2, revision_count: 0 }
      ];

      try {
        await repo.updateSurveyStratums(surveyId, stratums);
      } catch (error) {
        expect(dbConnectionObj.knex).to.have.been.calledTwice;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to update survey stratums');
      }
    });
  });
});
