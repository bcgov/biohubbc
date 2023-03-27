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
      const response = await repo.insertProjectMetadataPublishRecord({ project_id: 1, queue_id: 1 });

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
        await repo.insertProjectMetadataPublishRecord({ project_id: 1, queue_id: 1 });
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
      const response = await repo.insertSurveyMetadataPublishRecord({ survey_id: 1, queue_id: 1 });

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
        await repo.insertSurveyMetadataPublishRecord({ survey_id: 1, queue_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Survey Metadata Publish record');
      }
    });
  });

  describe('insertSurveySummaryPublishRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ survey_summary_submission_publish_id: 1 }] } as any) as Promise<
            QueryResult<any>
          >;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertSurveySummaryPublishRecord({ survey_summary_submission_id: 1, artifact_id: 1 });

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
        await repo.insertSurveySummaryPublishRecord({ survey_summary_submission_id: 1, artifact_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Survey Summary Publish record');
      }
    });
  });

  describe('insertOccurrenceSubmissionRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ occurrence_submission_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertOccurrenceSubmissionPublishRecord({ occurrence_submission_id: 1, queue_id: 1 });

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
        await repo.insertOccurrenceSubmissionPublishRecord({ occurrence_submission_id: 1, queue_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Occurrence Submission Publish record');
      }
    });
  });

  describe('insertProjectAttachmentPublishRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ project_attachment_publish_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertProjectAttachmentPublishRecord({
        project_attachment_id: 1,
        artifact_id: 1
      });

      expect(response).to.be.eql({ project_attachment_publish_id: 1 });
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertProjectAttachmentPublishRecord({ project_attachment_id: 1, artifact_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Project Attachment Publish record');
      }
    });
  });

  describe('insertProjectReportPublishRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ project_report_publish_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertProjectReportPublishRecord({ project_report_attachment_id: 1, artifact_id: 1 });

      expect(response).to.be.eql({ project_report_publish_id: 1 });
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertProjectReportPublishRecord({ project_report_attachment_id: 1, artifact_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Project Report Publish record');
      }
    });
  });

  describe('insertSurveyAttachmentPublishRecord', () => {
    it('should insert a record and return an id', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 1, rows: [{ survey_attachment_publish_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertSurveyAttachmentPublishRecord({
        survey_attachment_id: 1,
        artifact_id: 1
      });

      expect(response).to.be.eql({ survey_attachment_publish_id: 1 });
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertSurveyAttachmentPublishRecord({ survey_attachment_id: 1, artifact_id: 1 });
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
          return ({ rowCount: 1, rows: [{ survey_report_publish_id: 1 }] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      const response = await repo.insertSurveyReportPublishRecord({ survey_report_attachment_id: 1, artifact_id: 1 });

      expect(response).to.be.eql({ survey_report_publish_id: 1 });
    });

    it('should throw a `Failed insert` error', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repo = new HistoryPublishRepository(mockConnection);
      try {
        await repo.insertSurveyReportPublishRecord({ survey_report_attachment_id: 1, artifact_id: 1 });
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to insert Survey Report Publish record');
      }
    });
  });

  describe('getProjectMetadataPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          (({ rowCount: 1, rows: [{ project_report_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const projectId = 1;
      const response = await repository.getProjectMetadataPublishRecord(projectId);

      expect(response).to.be.eql({ project_report_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const projectId = 1;
      const response = await repository.getProjectMetadataPublishRecord(projectId);

      expect(response).to.be.null;
    });
  });

  describe('getSurveyMetadataPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          (({ rowCount: 1, rows: [{ survey_report_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyId = 1;
      const response = await repository.getSurveyMetadataPublishRecord(surveyId);

      expect(response).to.be.eql({ survey_report_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyId = 1;
      const response = await repository.getSurveyMetadataPublishRecord(surveyId);

      expect(response).to.be.null;
    });
  });

  describe('getOccurrenceSubmissionPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          (({ rowCount: 1, rows: [{ occurrence_submission_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const occurrenceSubmissionId = 1;
      const response = await repository.getOccurrenceSubmissionPublishRecord(occurrenceSubmissionId);

      expect(response).to.be.eql({ occurrence_submission_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const occurrenceSubmissionId = 1;
      const response = await repository.getOccurrenceSubmissionPublishRecord(occurrenceSubmissionId);

      expect(response).to.be.null;
    });
  });

  describe('getProjectAttachmentPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          (({ rowCount: 1, rows: [{ project_attachment_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const projectAttachmentId = 1;
      const response = await repository.getProjectAttachmentPublishRecord(projectAttachmentId);

      expect(response).to.be.eql({ project_attachment_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const projectAttachmentId = 1;
      const response = await repository.getProjectAttachmentPublishRecord(projectAttachmentId);

      expect(response).to.be.null;
    });
  });

  describe('getProjectReportPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          (({ rowCount: 1, rows: [{ project_report_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const projectReportAttachmentId = 1;
      const response = await repository.getProjectReportPublishRecord(projectReportAttachmentId);

      expect(response).to.be.eql({ project_report_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const projectReportAttachmentId = 1;
      const response = await repository.getProjectReportPublishRecord(projectReportAttachmentId);

      expect(response).to.be.null;
    });
  });

  describe('getSurveyAttachmentPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          (({ rowCount: 1, rows: [{ survey_attachment_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyAttachmentId = 1;
      const response = await repository.getSurveyAttachmentPublishRecord(surveyAttachmentId);

      expect(response).to.be.eql({ survey_attachment_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
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
        sql: async () =>
          (({ rowCount: 1, rows: [{ survey_report_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyReportAttachmentId = 1;
      const response = await repository.getSurveyReportPublishRecord(surveyReportAttachmentId);

      expect(response).to.be.eql({ survey_report_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveyReportAttachmentId = 1;
      const response = await repository.getSurveyReportPublishRecord(surveyReportAttachmentId);

      expect(response).to.be.null;
    });
  });

  describe('getSurveySummarySubmissionPublishRecord', () => {
    it('should return a history publish record if one exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () =>
          (({ rowCount: 1, rows: [{ survey_summary_submission_publish_id: 1 }] } as any) as Promise<QueryResult<any>>)
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveySummarySubmissionId = 1;
      const response = await repository.getSurveySummarySubmissionPublishRecord(surveySummarySubmissionId);

      expect(response).to.be.eql({ survey_summary_submission_publish_id: 1 });
    });

    it('should return undefined if no history publish record exists', async () => {
      const mockConnection = getMockDBConnection({
        sql: async () => {
          return ({ rowCount: 0, rows: [] } as any) as Promise<QueryResult<any>>;
        }
      });

      const repository = new HistoryPublishRepository(mockConnection);

      const surveySummarySubmissionId = 1;
      const response = await repository.getSurveySummarySubmissionPublishRecord(surveySummarySubmissionId);

      expect(response).to.be.null;
    });
  });
});
