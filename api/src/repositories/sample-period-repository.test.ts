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

      const surveySampleSiteId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.getSamplePeriodsForSurveyMethodId(surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleSiteId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.getSamplePeriodsForSurveyMethodId(surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });
  });

  describe('updateSamplePeriod', () => {
    it('should update the record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const samplePeriod: UpdateSamplePeriodRecord = {
        survey_sample_method_id: 1,
        survey_sample_period_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.updateSamplePeriod(samplePeriod);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const samplePeriod: UpdateSamplePeriodRecord = {
        survey_sample_method_id: 1,
        survey_sample_period_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.updateSamplePeriod(samplePeriod);
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
        end_date: '2023-01-02'
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
        end_date: '2023-01-02'
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

      const surveySamplePeriodId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.deleteSamplePeriodRecord(surveySamplePeriodId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySamplePeriodId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.deleteSamplePeriodRecord(surveySamplePeriodId);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample period');
      }
    });
  });
});
