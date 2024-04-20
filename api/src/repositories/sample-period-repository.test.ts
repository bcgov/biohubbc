import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { InsertSamplePeriodRecord, SamplePeriodRepository, UpdateSamplePeriodRecord } from './sample-period-repository';

chai.use(sinonChai);

describe('SamplePeriodRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSamplePeriodsForSurveyMethodId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.getSamplePeriodsForSurveyMethodId(mockSurveyId, surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.getSamplePeriodsForSurveyMethodId(mockSurveyId, surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });
  });

  describe('getSamplePeriodHierarchyIds', () => {
    it('should update the record and return a single row', async () => {
      const mockRow = {
        survey_sample_site_id: 1,
        survey_sample_method_id: 2,
        survey_sample_period_id: 3
      };
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const surveySamplePeriodId = 3;

      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.getSamplePeriodHierarchyIds(surveyId, surveySamplePeriodId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is 0', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const surveySamplePeriodId = 3;

      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.getSamplePeriodHierarchyIds(surveyId, surveySamplePeriodId);
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to get sample period hierarchy ids');
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
      }
    });

    it('throws an error if rowCount is > 1', async () => {
      const mockResponse = { rows: [], rowCount: 2 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const surveySamplePeriodId = 3;

      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.getSamplePeriodHierarchyIds(surveyId, surveySamplePeriodId);
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to get sample period hierarchy ids');
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
      }
    });
  });

  describe('updateSamplePeriod', () => {
    it('should update the record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const samplePeriod: UpdateSamplePeriodRecord = {
        survey_sample_method_id: 1,
        survey_sample_period_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.updateSamplePeriod(mockSurveyId, samplePeriod);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const samplePeriod: UpdateSamplePeriodRecord = {
        survey_sample_method_id: 1,
        survey_sample_period_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.updateSamplePeriod(mockSurveyId, samplePeriod);
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to update sample period');
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
      }
    });
  });

  describe('insertSamplePeriod', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const samplePeriod: InsertSamplePeriodRecord = {
        survey_sample_method_id: 1,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.insertSamplePeriod(samplePeriod);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const samplePeriod: InsertSamplePeriodRecord = {
        survey_sample_method_id: 1,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.insertSamplePeriod(samplePeriod);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert sample period');
      }
    });
  });

  describe('deleteSamplePeriodRecord', () => {
    it('should delete a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySamplePeriodId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.deleteSamplePeriodRecord(mockSurveyId, surveySamplePeriodId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySamplePeriodId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.deleteSamplePeriodRecord(mockSurveyId, surveySamplePeriodId);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample period');
      }
    });
  });
});
