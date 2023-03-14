import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HistoryPublishRepository } from '../repositories/history-publish-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishService } from './history-publish-service';

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
});
