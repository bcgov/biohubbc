import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import {
  InsertSamplePeriodObject,
  SamplePeriodRepository,
  SurveySamplePeriodDetails,
  UpdateSamplePeriodObject
} from './sample-period-repository';

chai.use(sinonChai);

describe('SamplePeriodRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSamplePeriodById', () => {
    it('should return non-empty rows', async () => {
      const mockRow: SurveySamplePeriodDetails = {
        survey_sample_period_id: 2,
        survey_id: 4,
        survey_sample_site_id: 1,
        method_technique_id: 3,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00',
        survey_sample_site: {
          survey_sample_site_id: 1,
          name: 'Site'
        },
        method_technique: {
          method_technique_id: 3,
          name: 'Technique',
          description: 'Description',
          method_response_metric_id: 2
        }
      };
      const mockResponse = { rows: [mockRow], rowCount: 2 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.getSamplePeriodById(mockSurveyId, surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });
  });

  describe('updateSamplePeriod', () => {
    it('should update the record and return a single row', async () => {
      const mockResponse = { rows: [], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const samplePeriod: UpdateSamplePeriodObject = {
        survey_sample_period_id: 2,
        survey_id: 4,
        survey_sample_site_id: 1,
        method_technique_id: 3,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.updateSamplePeriod(mockSurveyId, samplePeriod);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.be.undefined;
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const samplePeriod: UpdateSamplePeriodObject = {
        survey_sample_period_id: 2,
        survey_id: 4,
        survey_sample_site_id: 1,
        method_technique_id: 3,
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
        expect(dbConnectionObj.knex).to.have.been.calledOnce;
      }
    });
  });

  describe('insertSamplePeriods', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const samplePeriod: InsertSamplePeriodObject = {
        survey_sample_site_id: 1,
        method_technique_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.insertSamplePeriod(surveyId, samplePeriod);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const samplePeriod: InsertSamplePeriodObject = {
        survey_sample_site_id: 1,
        method_technique_id: 2,
        start_date: '2023-10-02',
        end_date: '2023-01-02',
        start_time: '12:00:00',
        end_time: '13:00:00'
      };
      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.insertSamplePeriod(surveyId, samplePeriod);
      } catch (error) {
        expect(dbConnectionObj.knex).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert survey sample period');
      }
    });
  });

  describe('deleteSamplePeriod', () => {
    it('should delete a single record', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySamplePeriodId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);
      const response = await repo.deleteSamplePeriod(mockSurveyId, surveySamplePeriodId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.be.undefined;
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySamplePeriodId = 1;
      const repo = new SamplePeriodRepository(dbConnectionObj);

      try {
        await repo.deleteSamplePeriod(mockSurveyId, surveySamplePeriodId);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample period');
      }
    });
  });
});
