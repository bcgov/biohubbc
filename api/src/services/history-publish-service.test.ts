import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  HistoryPublishRepository,
  OccurrenceSubmissionPublish,
  ProjectAttachmentPublish,
  ProjectMetadataPublish,
  ProjectReportPublish,
  SurveyAttachmentPublish,
  SurveyMetadataPublish,
  SurveyReportPublish,
  SurveySummarySubmissionPublish
} from '../repositories/history-publish-repository';
import { ISurveySummaryDetails } from '../repositories/summary-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishService } from './history-publish-service';
import { SummaryService } from './summary-service';

chai.use(sinonChai);

describe('HistoryPublishService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertProjectMetadataPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        project_id: 1,
        queue_id: 1
      };

      const repoStub = sinon.stub(HistoryPublishRepository.prototype, 'insertProjectMetadataPublishRecord').resolves(1);

      const response = await service.insertProjectMetadataPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(1);
    });
  });

  describe('insertSurveyMetadataPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        survey_id: 1,
        queue_id: 1
      };

      const repoStub = sinon.stub(HistoryPublishRepository.prototype, 'insertSurveyMetadataPublishRecord').resolves(1);

      const response = await service.insertSurveyMetadataPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(1);
    });
  });

  describe('insertOccurrenceSubmissionPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        occurrence_submission_id: 1,
        queue_id: 1
      };

      const repoStub = sinon
        .stub(HistoryPublishRepository.prototype, 'insertOccurrenceSubmissionPublishRecord')
        .resolves(1);

      const response = await service.insertOccurrenceSubmissionPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(1);
    });
  });

  describe('insertProjectAttachmentPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        project_attachment_id: 1,
        artifact_id: 1
      };

      const repoStub = sinon
        .stub(HistoryPublishRepository.prototype, 'insertProjectAttachmentPublishRecord')
        .resolves({ project_attachment_publish_id: 1 });

      const response = await service.insertProjectAttachmentPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ project_attachment_publish_id: 1 });
    });
  });

  describe('insertProjectReportPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        project_report_attachment_id: 1,
        artifact_id: 1
      };

      const repoStub = sinon
        .stub(HistoryPublishRepository.prototype, 'insertProjectReportPublishRecord')
        .resolves({ project_report_publish_id: 1 });

      const response = await service.insertProjectReportPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ project_report_publish_id: 1 });
    });
  });

  describe('insertSurveyAttachmentPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        survey_attachment_id: 1,
        artifact_id: 1
      };

      const repoStub = sinon
        .stub(HistoryPublishRepository.prototype, 'insertSurveyAttachmentPublishRecord')
        .resolves({ survey_attachment_publish_id: 1 });

      const response = await service.insertSurveyAttachmentPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ survey_attachment_publish_id: 1 });
    });
  });

  describe('insertSurveyReportPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        survey_report_attachment_id: 1,
        artifact_id: 1
      };

      const repoStub = sinon
        .stub(HistoryPublishRepository.prototype, 'insertSurveyReportPublishRecord')
        .resolves({ survey_report_publish_id: 1 });

      const response = await service.insertSurveyReportPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ survey_report_publish_id: 1 });
    });
  });

  describe('insertSurveySummaryPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        survey_summary_submission_id: 1,
        artifact_id: 1
      };

      const repoStub = sinon
        .stub(HistoryPublishRepository.prototype, 'insertSurveySummaryPublishRecord')
        .resolves({ survey_summary_submission_publish_id: 1 });

      const response = await service.insertSurveySummaryPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ survey_summary_submission_publish_id: 1 });
    });
  });

  describe('getProjectMetadataPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ project_metadata_publish_id: 1 } as unknown) as ProjectMetadataPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getProjectMetadataPublishRecord')
        .resolves(mockResponse);

      const projectId = 1;
      const response = await service.getProjectMetadataPublishRecord(projectId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getSurveyMetadataPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ survey_metadata_publish_id: 1 } as unknown) as SurveyMetadataPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveyMetadataPublishRecord')
        .resolves(mockResponse);

      const surveyId = 1;
      const response = await service.getSurveyMetadataPublishRecord(surveyId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getOccurrenceSubmissionPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ occurrence_submission_publish_id: 1 } as unknown) as OccurrenceSubmissionPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getOccurrenceSubmissionPublishRecord')
        .resolves(mockResponse);

      const occurrenceSubmissionId = 1;
      const response = await service.getOccurrenceSubmissionPublishRecord(occurrenceSubmissionId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getProjectAttachmentPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ project_attachment_publish_id: 1 } as unknown) as ProjectAttachmentPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getProjectAttachmentPublishRecord')
        .resolves(mockResponse);

      const projectAttachmentId = 1;
      const response = await service.getProjectAttachmentPublishRecord(projectAttachmentId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getProjectReportPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ project_report_publish_id: 1 } as unknown) as ProjectReportPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getProjectReportPublishRecord')
        .resolves(mockResponse);

      const projectReportAttachmentId = 1;
      const response = await service.getProjectReportPublishRecord(projectReportAttachmentId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getSurveyAttachmentPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ survey_attachment_publish_id: 1 } as unknown) as SurveyAttachmentPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveyAttachmentPublishRecord')
        .resolves(mockResponse);

      const surveyAttachmentId = 1;
      const response = await service.getSurveyAttachmentPublishRecord(surveyAttachmentId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getSurveyReportPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ survey_report_publish_id: 1 } as unknown) as SurveyReportPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveyReportPublishRecord')
        .resolves(mockResponse);

      const surveyReportAttachmentId = 1;
      const response = await service.getSurveyReportPublishRecord(surveyReportAttachmentId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getSurveySummarySubmissionPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = ({ survey_summary_submission_publish_id: 1 } as unknown) as SurveySummarySubmissionPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveySummarySubmissionPublishRecord')
        .resolves(mockResponse);

      const surveySummarySubmissionId = 1;
      const response = await service.getSurveySummarySubmissionPublishRecord(surveySummarySubmissionId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('hasUnpublishedSurveyAttachments', () => {
    it('returns true for unpublished records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountSurveyUnpublishedAttachments')
        .resolves(({ rows: [{ count: 2 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedSurveyAttachments(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(true);
    });

    it('returns false for published records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountSurveyUnpublishedAttachments')
        .resolves(({ rows: [{ count: 0 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedSurveyAttachments(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(false);
    });
  });

  describe('hasUnpublishedSurveyReports', () => {
    it('returns true for unpublished records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountSurveyUnpublishedReports')
        .resolves(({ rows: [{ count: 2 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedSurveyReports(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(true);
    });

    it('returns false for published records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountSurveyUnpublishedReports')
        .resolves(({ rows: [{ count: 0 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedSurveyReports(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(false);
    });
  });

  describe('hasUnpublishedObservation', () => {
    it('returns false for published occurrence records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const observationStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getLatestUndeletedObservationRecordId')
        .resolves(({ rows: [{ occurrence_submission_id: 2 }], rowCount: 1 } as unknown) as QueryResult);

      const observationPublishStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getOccurrenceSubmissionPublishRecord')
        .resolves(({
          rows: [{ occurrence_submission_publish_id: 4 }],
          rowCount: 1
        } as unknown) as OccurrenceSubmissionPublish);

      const response = await service.hasUnpublishedObservation(20);

      expect(observationStub).to.be.calledOnce;
      expect(observationStub).to.be.calledWith(20);
      expect(observationPublishStub).to.be.calledOnce;
      expect(observationPublishStub).to.be.calledWith(2);
      expect(response).to.eql(false);
    });

    it('returns false for no occurrence records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const observationStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getLatestUndeletedObservationRecordId')
        .resolves(({ rows: [], rowCount: 0 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedObservation(20);

      expect(observationStub).to.be.calledOnce;
      expect(observationStub).to.be.calledWith(20);
      expect(response).to.eql(false);
    });

    it('returns true for unpublished occurrence record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const observationStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getLatestUndeletedObservationRecordId')
        .resolves(({ rows: [{ occurrence_submission_id: 2 }], rowCount: 1 } as unknown) as QueryResult);

      const observationPublishStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getOccurrenceSubmissionPublishRecord')
        .resolves(({ rows: [], rowCount: 0 } as unknown) as OccurrenceSubmissionPublish);

      const response = await service.hasUnpublishedObservation(20);

      expect(observationStub).to.be.calledOnce;
      expect(observationStub).to.be.calledWith(20);
      expect(observationPublishStub).to.be.calledOnce;
      expect(observationPublishStub).to.be.calledWith(2);
      expect(response).to.eql(true);
    });
  });

  describe('hasUnpublishedSummaryResults', () => {
    it('returns false for published summary results records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const summaryStub = sinon.stub(SummaryService.prototype, 'getLatestSurveySummarySubmission').resolves(({
        rows: [
          {
            survey_summary_submission_id: 4,
            key: 1,
            uuid: 1,
            file_name: '',
            delete_timestamp: null,
            submission_message_type_id: 1,
            message: '',
            submission_message_type_name: '',
            summary_submission_message_class_id: 1,
            submission_message_class_name: ''
          }
        ],
        rowCount: 1
      } as unknown) as ISurveySummaryDetails);

      const summaryPublishStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveySummarySubmissionPublishRecord')
        .resolves(({
          rows: [{ survey_summary_submission_publish_id: 4 }],
          rowCount: 1
        } as unknown) as SurveySummarySubmissionPublish);

      const response = await service.hasUnpublishedSummaryResults(20);

      expect(summaryStub).to.be.calledOnce;
      expect(summaryStub).to.be.calledWith(20);
      expect(summaryPublishStub).to.be.calledOnce;
      expect(summaryPublishStub).to.be.calledWith(2);
      expect(response).to.eql(false);
    });

    it('returns false for no summary results records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const sumamryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveySummarySubmissionPublishRecord')
        .resolves(({ rows: [], rowCount: 0 } as unknown) as SurveySummarySubmissionPublish);

      const response = await service.hasUnpublishedSummaryResults(20);

      expect(sumamryStub).to.be.calledOnce;
      expect(sumamryStub).to.be.calledWith(20);
      expect(response).to.eql(false);
    });

    it('returns true for unpublished summary results records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const sumamryStub = sinon.stub(SummaryService.prototype, 'getLatestSurveySummarySubmission').resolves(({
        rows: [
          {
            survey_summary_submission_id: 1,
            key: 1,
            uuid: 1,
            file_name: '',
            delete_timestamp: null,
            submission_message_type_id: 1,
            message: '',
            submission_message_type_name: '',
            summary_submission_message_class_id: 1,
            submission_message_class_name: ''
          }
        ],
        rowCount: 1
      } as unknown) as ISurveySummaryDetails);

      const summaryPublishStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveySummarySubmissionPublishRecord')
        .resolves(({
          rows: [
            {
              survey_summary_submission_publish_id: 1,
              survey_summary_submission_id: 1,
              event_timestamp: 1,
              artifact_revision_id: 1,
              create_date: '',
              create_user: 1,
              update_date: '',
              update_user: 1,
              revision_count: 1
            }
          ],
          rowCount: 0
        } as unknown) as SurveySummarySubmissionPublish);

      const response = await service.hasUnpublishedSummaryResults(20);

      expect(sumamryStub).to.be.calledOnce;
      expect(sumamryStub).to.be.calledWith(20);
      expect(summaryPublishStub).to.be.calledOnce;
      expect(summaryPublishStub).to.be.calledWith(2);
      expect(response).to.eql(true);
    });
  });

  describe('hasUnpublishedProjectAttachments', () => {
    it('returns true for unpublished records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountProjectUnpublishedAttachments')
        .resolves(({ rows: [{ count: 2 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedProjectAttachments(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(true);
    });

    it('returns false for published records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountProjectUnpublishedAttachments')
        .resolves(({ rows: [{ count: 0 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedProjectAttachments(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(false);
    });
  });

  describe('hasUnpublishedProjectReports', () => {
    it('returns true for unpublished records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountProjectUnpublishedReports')
        .resolves(({ rows: [{ count: 2 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedProjectReports(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(true);
    });

    it('returns false for published records', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getCountProjectUnpublishedReports')
        .resolves(({ rows: [{ count: 0 }], rowCount: 1 } as unknown) as QueryResult);

      const response = await service.hasUnpublishedProjectReports(20);

      expect(repositoryStub).to.be.calledOnce;
      expect(repositoryStub).to.be.calledWith(20);
      expect(response).to.eql(false);
    });
  });
});
