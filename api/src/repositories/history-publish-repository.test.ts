import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishRepository } from './history-publish-repository';

chai.use(sinonChai);

describe('HistoryPublishRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertProjectMetadataRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ project_metadata_publish_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertProjectMetadataRecord({ project_id: 1, queue_id: 1 });

      expect(response).to.be.eql(1);
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertProjectMetadataRecord({ project_id: 1, queue_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Project Metadata Publish record');
      }
    });
  });

  describe('insertSurveyMetadataRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ project_metadata_publish_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertSurveyMetadataRecord({ survey_id: 1, queue_id: 1 });

      expect(response).to.be.eql(1);
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertSurveyMetadataRecord({ survey_id: 1, queue_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Survey Metadata Publish record');
      }
    });
  });

  describe('insertOccurrenceSubmissionRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ project_metadata_publish_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertOccurrenceSubmissionRecord({ occurrence_submission_id: 1, queue_id: 1 });

      expect(response).to.be.eql(1);
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertOccurrenceSubmissionRecord({ occurrence_submission_id: 1, queue_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Occurrence Submission Publish record');
      }
    });
  });
});
