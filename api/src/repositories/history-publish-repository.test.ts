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

  describe('insertSurveyMetadataRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 1, rows: [{ project_metadata_publish_id: 1 }] } as any as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertSurveyMetadataPublishRecord({
        survey_id: 1,
        submission_uuid: '550e8400-e29b-41d4-a716-446655440000'
      });

      expect(response).to.be.eql(1);
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertSurveyMetadataPublishRecord({
          survey_id: 1,
          submission_uuid: '550e8400-e29b-41d4-a716-446655440000'
        });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Survey Metadata Publish record');
      }
    });
  });

  describe('insertSurveyAttachmentPublishRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 1, rows: [{ survey_attachment_publish_id: 1 }] } as any as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertSurveyAttachmentPublishRecord({
        survey_attachment_id: 1,
        artifact_uuid: '123-456-789'
      });

      expect(response).to.be.eql({ survey_attachment_publish_id: 1 });
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertSurveyAttachmentPublishRecord({ survey_attachment_id: 1, artifact_uuid: '123-456-789' });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Survey Attachment Publish record');
      }
    });
  });

  describe('insertSurveyReportPublishRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 1, rows: [{ survey_report_publish_id: 1 }] } as any as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertSurveyReportPublishRecord({
        survey_report_attachment_id: 1,
        artifact_uuid: '123-456-789'
      });

      expect(response).to.be.eql({ survey_report_publish_id: 1 });
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertSurveyReportPublishRecord({ survey_report_attachment_id: 1, artifact_uuid: '123-456-789' });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Survey Report Publish record');
      }
    });
  });

  describe('getSurveyMetadataPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => ({ rowCount: 1, rows: [{ survey_report_publish_id: 1 }] }) as any as Promise<QueryResult<any>>
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyId = 1;
      const response = await repository.getSurveyMetadataPublishRecord(surveyId);

      expect(response).to.be.eql({ survey_report_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyId = 1;
      const response = await repository.getSurveyMetadataPublishRecord(surveyId);

      expect(response).to.be.null;
    });
  });

  describe('getSurveyAttachmentPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          ({ rowCount: 1, rows: [{ survey_attachment_publish_id: 1 }] }) as any as Promise<QueryResult<any>>
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyAttachmentId = 1;
      const response = await repository.getSurveyAttachmentPublishRecord(surveyAttachmentId);

      expect(response).to.be.eql({ survey_attachment_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyAttachmentId = 1;
      const response = await repository.getSurveyAttachmentPublishRecord(surveyAttachmentId);

      expect(response).to.be.null;
    });
  });

  describe('getSurveyReportPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => ({ rowCount: 1, rows: [{ survey_report_publish_id: 1 }] }) as any as Promise<QueryResult<any>>
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyReportAttachmentId = 1;
      const response = await repository.getSurveyReportPublishRecord(surveyReportAttachmentId);

      expect(response).to.be.eql({ survey_report_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return { rowCount: 0, rows: [] } as any as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyReportAttachmentId = 1;
      const response = await repository.getSurveyReportPublishRecord(surveyReportAttachmentId);

      expect(response).to.be.null;
    });
  });

  describe('getSurveyMetadataPublishRecordBySubmissionUuid', () => {
    it('should return a record when one exists', async () => {
      const submissionUuid = '550e8400-e29b-41d4-a716-446655440000';
      const mockRow = {
        survey_metadata_publish_id: 1,
        survey_id: 2,
        submission_uuid: submissionUuid
      };
      const mockConnection = getMockDBConnection({
        sql: async () => ({ rowCount: 1, rows: [mockRow] }) as any as Promise<QueryResult<any>>
      });

      const repository = new HistoryPublishRepository(mockConnection);
      const response = await repository.getSurveyMetadataPublishRecordBySubmissionUuid(submissionUuid);

      expect(response).to.be.eql(mockRow);
    });

    it('should return null when no record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => ({ rowCount: 0, rows: [] }) as any as Promise<QueryResult<any>>
      });

      const repository = new HistoryPublishRepository(mockConnection);
      const response = await repository.getSurveyMetadataPublishRecordBySubmissionUuid(
        '550e8400-e29b-41d4-a716-446655440000'
      );

      expect(response).to.be.null;
    });
  });
});
