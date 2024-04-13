import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleStratumRepository, UpdateSampleStratumRecord } from './sample-stratums-repository';

chai.use(sinonChai);

describe('SampleStratumRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSampleStratumsForSurveySampleSiteId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleSiteId = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.getSampleStratumsForSurveySampleSiteId(surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleSiteId = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.getSampleStratumsForSurveySampleSiteId(surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleStratumsForSurveyStratumId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyStratumId = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.getSampleStratumsForSurveyStratumId(surveyStratumId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyStratumId = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.getSampleStratumsForSurveyStratumId(surveyStratumId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleStratumsCountForSurveyStratumId', () => {
    it('should return a count of 2 records', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyStratumId = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.getSampleStratumsForSurveyStratumId(surveyStratumId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response.length).to.eql(mockRows.length);
    });

    it('should return a count of 0 records', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyStratumId = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.getSampleStratumsForSurveyStratumId(surveyStratumId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response.length).to.eql(mockRows.length);
    });
  });

  describe('insertSampleStratum', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleStratum: UpdateSampleStratumRecord = {
        survey_sample_stratum_id: 1,
        survey_sample_site_id: 2,
        survey_stratum_id: 3
      };
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.insertSampleStratum(sampleStratum);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleStratum: UpdateSampleStratumRecord = {
        survey_sample_stratum_id: 1,
        survey_sample_site_id: 2,
        survey_stratum_id: 3
      };
      const repo = new SampleStratumRepository(dbConnectionObj);

      try {
        await repo.insertSampleStratum(sampleStratum);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert sample stratum');
      }
    });
  });

  describe('deleteSampleStratumRecords', () => {
    it('should delete one or more records and return multiple rows', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveySampleStratumIds = [1];
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.deleteSampleStratumRecords(surveySampleStratumIds);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql([mockRow]);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveySampleStratumId = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);

      try {
        await repo.deleteSampleStratumRecords([surveySampleStratumId]);
      } catch (error) {
        expect(dbConnectionObj.knex).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample stratum');
      }
    });
  });

  describe('deleteSampleStratumRecordsByStratumIds', () => {
    it('should delete one or more record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveyStratumIds = [1, 2];
      const repo = new SampleStratumRepository(dbConnectionObj);
      const response = await repo.deleteSampleStratumRecordsByStratumIds(surveyStratumIds);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql([mockRow]);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveyStratumIds = 1;
      const repo = new SampleStratumRepository(dbConnectionObj);

      try {
        await repo.deleteSampleStratumRecordsByStratumIds([surveyStratumIds]);
      } catch (error) {
        expect(dbConnectionObj.knex).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample stratum');
      }
    });
  });
});
