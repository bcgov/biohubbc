import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { SampleBlockRepository, UpdateSampleBlockRecord } from './sample-blocks-repository';

chai.use(sinonChai);

describe('SampleBlockRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getSampleBlocksForSurveySampleSiteId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleSiteId = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveySampleSiteId = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.getSampleBlocksForSurveySampleSiteId(surveySampleSiteId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleBlocksForSurveyBlockId', () => {
    it('should return non-empty rows', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyBlockId = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.getSampleBlocksForSurveyBlockId(surveyBlockId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });

    it('should return empty rows', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyBlockId = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.getSampleBlocksForSurveyBlockId(surveyBlockId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRows);
    });
  });

  describe('getSampleBlocksCountForSurveyBlockId', () => {
    it('should return a count of 2 records', async () => {
      const mockRows: any[] = [{}, {}];
      const mockResponse = ({ rows: mockRows, rowCount: 2 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyBlockId = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.getSampleBlocksForSurveyBlockId(surveyBlockId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response.length).to.eql(mockRows.length);
    });

    it('should return a count of 0 records', async () => {
      const mockRows: any[] = [];
      const mockResponse = ({ rows: mockRows, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const surveyBlockId = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.getSampleBlocksForSurveyBlockId(surveyBlockId);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response.length).to.eql(mockRows.length);
    });
  });

  describe('insertSampleBlock', () => {
    it('should insert a record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleBlock: UpdateSampleBlockRecord = {
        survey_sample_block_id: 1,
        survey_sample_site_id: 2,
        survey_block_id: 3
      };
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.insertSampleBlock(sampleBlock);

      expect(dbConnectionObj.sql).to.have.been.calledOnce;
      expect(response).to.eql(mockRow);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const sampleBlock: UpdateSampleBlockRecord = {
        survey_sample_block_id: 1,
        survey_sample_site_id: 2,
        survey_block_id: 3
      };
      const repo = new SampleBlockRepository(dbConnectionObj);

      try {
        await repo.insertSampleBlock(sampleBlock);
      } catch (error) {
        expect(dbConnectionObj.sql).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to insert sample block');
      }
    });
  });

  describe('deleteSampleBlockRecords', () => {
    it('should delete one or more records and return multiple rows', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveySampleBlockIds = [1];
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.deleteSampleBlockRecords(surveySampleBlockIds);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql([mockRow]);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveySampleBlockId = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);

      try {
        await repo.deleteSampleBlockRecords([surveySampleBlockId]);
      } catch (error) {
        expect(dbConnectionObj.knex).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample block');
      }
    });
  });

  describe('deleteSampleBlockRecordsByBlockIds', () => {
    it('should delete one or more record and return a single row', async () => {
      const mockRow = {};
      const mockResponse = ({ rows: [mockRow], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveyBlockIds = [1, 2];
      const repo = new SampleBlockRepository(dbConnectionObj);
      const response = await repo.deleteSampleBlockRecordsByBlockIds(surveyBlockIds);

      expect(dbConnectionObj.knex).to.have.been.calledOnce;
      expect(response).to.eql([mockRow]);
    });

    it('throws an error if rowCount is falsy', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnectionObj = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const surveyBlockIds = 1;
      const repo = new SampleBlockRepository(dbConnectionObj);

      try {
        await repo.deleteSampleBlockRecordsByBlockIds([surveyBlockIds]);
      } catch (error) {
        expect(dbConnectionObj.knex).to.have.been.calledOnce;
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to delete sample block');
      }
    });
  });
});
