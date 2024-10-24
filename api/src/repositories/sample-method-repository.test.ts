import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { InsertSampleMethodRecord, SampleMethodRepository, UpdateSampleMethodRecord } from './sample-method-repository';

chai.use(sinonChai);

describe('SampleMethodRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSampleMethodsForSurveySampleSiteId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = { rows: mockRows, rowCount: 2 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const repo = new SampleMethodRepository(dbConnectionObj);
      const response = await repo.getSampleMethodsForSurveySampleSiteId(mockSurveyId, surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = { rows: mockRows, rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const repo = new SampleMethodRepository(dbConnectionObj);
      const response = await repo.getSampleMethodsForSurveySampleSiteId(mockSurveyId, surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleMethodsCountForTechniqueId', () => {
    it('should return a non-zero count', async () => {
      const count = 2;
      const mockRows: any[] = [{ count }];
      const mockResponse = { rows: mockRows, rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const techniqueIds = [1, 2];
      const repo = new SampleMethodRepository(dbConnectionObj);
      const response = await repo.getSampleMethodsCountForTechniqueIds(techniqueIds);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql(count);
    });
  });

  describe('updateSampleMethod', () => {
    it('should update the record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const sampleMethod: UpdateSampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_response_metric_id: 1,
        method_technique_id: 3,
        description: 'description',
        sample_periods: [
          {
            end_date: '2023-01-02',
            start_date: '2023-10-02',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1,
            survey_sample_period_id: 4
          },
          {
            end_date: '2023-10-03',
            start_date: '2023-11-05',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1,
            survey_sample_period_id: 5
          }
        ]
      };
      const repo = new SampleMethodRepository(dbConnectionObj);
      const response = await repo.updateSampleMethod(surveyId, sampleMethod);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const sampleMethod: UpdateSampleMethodRecord = {
        survey_sample_method_id: 1,
        survey_sample_site_id: 2,
        method_technique_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        sample_periods: [
          {
            end_date: '2023-01-02',
            start_date: '2023-10-02',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1,
            survey_sample_period_id: 4
          },
          {
            end_date: '2023-10-03',
            start_date: '2023-11-05',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1,
            survey_sample_period_id: 5
          }
        ]
      };
      const repo = new SampleMethodRepository(dbConnectionObj);

      try {
        await repo.updateSampleMethod(surveyId, sampleMethod);
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to update sample method');
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
      }
    });
  });

  describe('insertSampleMethod', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleMethod: InsertSampleMethodRecord = {
        survey_sample_site_id: 2,
        method_technique_id: 3,
        method_response_metric_id: 1,
        description: 'description',
        sample_periods: [
          {
            end_date: '2023-01-02',
            start_date: '2023-10-02',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1
          },
          {
            end_date: '2023-10-03',
            start_date: '2023-11-05',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1
          }
        ]
      };
      const repo = new SampleMethodRepository(dbConnectionObj);
      const response = await repo.insertSampleMethod(sampleMethod);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleMethod: InsertSampleMethodRecord = {
        survey_sample_site_id: 2,
        method_response_metric_id: 1,
        method_technique_id: 3,
        description: 'description',
        sample_periods: [
          {
            end_date: '2023-01-02',
            start_date: '2023-10-02',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1
          },
          {
            end_date: '2023-10-03',
            start_date: '2023-11-05',
            start_time: '12:00:00',
            end_time: '13:00:00',
            survey_sample_method_id: 1
          }
        ]
      };
      const repo = new SampleMethodRepository(dbConnectionObj);

      try {
        await repo.insertSampleMethod(sampleMethod);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert sample method');
      }
    });
  });

  describe('deleteSampleMethodRecord', () => {
    it('should delete a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleMethodId = 1;
      const mockSurveyId = 1001;
      const repo = new SampleMethodRepository(dbConnectionObj);
      const response = await repo.deleteSampleMethodRecord(mockSurveyId, surveySampleMethodId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1001;
      const surveySampleMethodId = 1;
      const repo = new SampleMethodRepository(dbConnectionObj);

      try {
        await repo.deleteSampleMethodRecord(mockSurveyId, surveySampleMethodId);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample method');
      }
    });
  });
});
