import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../../__mocks__/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { InsertSampleSiteRecord, SampleLocationRepository, UpdateSampleSiteRecord } from './sample-location-repository';

chai.use(sinonChai);

describe('SampleLocationRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSampleLocationsForSurveyId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = { rows: mockRows, rowCount: 2 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.getSampleLocationsForSurveyId(surveySampleSiteId);

      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = { rows: mockRows, rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.getSampleLocationsForSurveyId(surveySampleSiteId);

      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleLocationsCountBySurveyId', () => {
    it('should return the sample location count successfully', async () => {
      const mockResponse = { rows: [{ count: 69 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: () => mockResponse });

      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.getSampleLocationsCountBySurveyId(1001);

      expect(response).to.eql(69);
    });

    it('should throw an exception if row count is 0', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repo = new SampleLocationRepository(dbConnectionObj);

      try {
        await repo.getSampleLocationsCountBySurveyId(1001);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to get sample site count');
      }
    });
  });

  describe('getSurveySampleLocationBySiteId', () => {
    it('should return a single sample location', async () => {
      const mockRows = [{ survey_sample_site_id: 1 }];
      const mockResponse = { rows: [mockRows], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const surveyId = 2;

      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.getSurveySampleLocationBySiteId(surveyId, surveySampleSiteId);

      expect(response).to.eql(mockRows);
    });
  });

  describe('updateSampleSite', () => {
    it('should update the record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: UpdateSampleSiteRecord = {
        survey_sample_site_id: 1,
        survey_id: 2,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.updateSampleSite(sampleLocation);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: UpdateSampleSiteRecord = {
        survey_sample_site_id: 1,
        survey_id: 2,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);

      try {
        await repo.updateSampleSite(sampleLocation);
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to update sample location record');
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
      }
    });
  });

  describe('insertSampleSite', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: InsertSampleSiteRecord = {
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.insertSampleSite(2, sampleLocation);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: InsertSampleSiteRecord = {
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);

      try {
        await repo.insertSampleSite(2, sampleLocation);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert sample location');
      }
    });
  });

  describe('deleteSampleSiteRecord', () => {
    it('should delete a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleLocationId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.deleteSampleSiteRecord(mockSurveyId, surveySampleLocationId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleLocationId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);

      try {
        await repo.deleteSampleSiteRecord(mockSurveyId, surveySampleLocationId);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete survey block record');
      }
    });
  });
});
