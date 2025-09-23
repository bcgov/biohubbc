import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { getMockDBConnection } from '../../__mocks__/db';
import { InsertSampleSiteRecord, SampleSiteRepository, UpdateSampleSiteRecord } from './sample-site-repository';

chai.use(sinonChai);

describe('SampleSiteRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSampleSitesForSurveyIds', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = { rows: mockRows, rowCount: 2 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.getSampleSitesForSurveyIds([surveySampleSiteId]);

      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = { rows: mockRows, rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.getSampleSitesForSurveyIds([surveySampleSiteId]);

      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleSitesCountBySurveyId', () => {
    it('should return the sample site count successfully', async () => {
      const mockResponse = { rows: [{ count: 69 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: () => mockResponse });

      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.getSampleSitesCountBySurveyIds([1001]);

      expect(response).to.eql(69);
    });

    it('should throw an exception if row count is 0', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repo = new SampleSiteRepository(dbConnectionObj);

      try {
        await repo.getSampleSitesCountBySurveyIds([1001]);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to get sample site count');
      }
    });
  });

  describe('getSurveySampleSiteBySiteId', () => {
    it('should return a single sample site', async () => {
      const mockRows = [{ survey_sample_site_id: 1 }];
      const mockResponse = { rows: [mockRows], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: () => mockResponse });

      const surveySampleSiteId = 1;
      const surveyId = 2;

      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.getSurveySampleSiteBySiteId(surveyId, surveySampleSiteId);

      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleSitesGeometryBySurveyId', () => {
    it('should return sample site geometries', async () => {
      const mockRows = [{ survey_sample_site_id: 1 }];
      const mockResponse = { rows: mockRows, rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 2;

      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.getSampleSitesGeometryBySurveyId(surveyId);

      expect(response).to.eql(mockRows);
    });
  });

  describe('findSites', () => {
    it('should return a list of sites when all filters provided', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SampleSiteRepository(dbConnection);

      const response = await repository.findSites(
        true,
        1,
        {
          survey_id: 2,
          keyword: 'term',
          system_user_id: 3
        },
        {
          limit: 10,
          page: 1,
          sort: 'name',
          order: 'asc'
        }
      );

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return a list of sites when no filters provided', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SampleSiteRepository(dbConnection);

      const response = await repository.findSites(false, 1, undefined, undefined);

      expect(response).to.eql([{ id: 1 }]);
    });
  });

  describe('updateSampleSite', () => {
    it('should update the record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const mockSampleSite: UpdateSampleSiteRecord = {
        survey_sample_site_id: 1,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.updateSampleSite(surveyId, mockSampleSite);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyId = 1;
      const mockSampleSite: UpdateSampleSiteRecord = {
        survey_sample_site_id: 1,
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleSiteRepository(dbConnectionObj);

      try {
        await repo.updateSampleSite(surveyId, mockSampleSite);
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to update sample site record');
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
      }
    });
  });

  describe('insertSampleSite', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSampleSite: InsertSampleSiteRecord = {
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.insertSampleSite(2, mockSampleSite);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSampleSite: InsertSampleSiteRecord = {
        name: 'name',
        description: 'description',
        geojson: {}
      };
      const repo = new SampleSiteRepository(dbConnectionObj);

      try {
        await repo.insertSampleSite(2, mockSampleSite);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert sample site');
      }
    });
  });

  describe('deleteSampleSiteRecord', () => {
    it('should delete a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = { rows: [mockRow], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const repo = new SampleSiteRepository(dbConnectionObj);
      const response = await repo.deleteSampleSiteRecord(mockSurveyId, surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const mockSurveyId = 1;
      const surveySampleSiteId = 1;
      const repo = new SampleSiteRepository(dbConnectionObj);

      try {
        await repo.deleteSampleSiteRecord(mockSurveyId, surveySampleSiteId);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete survey sample site record');
      }
    });
  });
});
