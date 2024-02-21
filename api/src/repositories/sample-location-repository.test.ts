import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleLocationRepository, UpdateSampleLocationRecord } from './sample-location-repository';

chai.use(sinonChai);

describe('SampleLocationRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSampleLocationsForSurveyId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.getSampleLocationsForSurveyId(surveySampleSiteId);

      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.getSampleLocationsForSurveyId(surveySampleSiteId);

      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleLocationsCountBySurveyId', () => {
    // @TODO
  });

  describe('updateSampleLocation', () => {
    it('should update the record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: UpdateSampleLocationRecord = {
        survey_sample_site_id: 1,
        survey_id: 2,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.updateSampleLocation(sampleLocation);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: UpdateSampleLocationRecord = {
        survey_sample_site_id: 1,
        survey_id: 2,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);

      try {
        await repo.updateSampleLocation(sampleLocation);
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to update sample location record');
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
      }
    });
  });

  describe('insertSampleLocation', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: UpdateSampleLocationRecord = {
        survey_sample_site_id: 1,
        survey_id: 2,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.insertSampleLocation(sampleLocation);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleLocation: UpdateSampleLocationRecord = {
        survey_sample_site_id: 1,
        survey_id: 2,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleLocationRepository(dbConnectionObj);

      try {
        await repo.insertSampleLocation(sampleLocation);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert sample location');
      }
    });
  });

  describe('deleteSampleLocationRecord', () => {
    it('should delete a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleLocationId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);
      const response = await repo.deleteSampleLocationRecord(surveySampleLocationId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleLocationId = 1;
      const repo = new SampleLocationRepository(dbConnectionObj);

      try {
        await repo.deleteSampleLocationRecord(surveySampleLocationId);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete survey block record');
      }
    });
  });
});
