import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  HistoryPublishRepository,
  SurveyAttachmentPublish,
  SurveyMetadataPublish,
  SurveyReportPublish
} from '../repositories/history-publish-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishService } from './history-publish-service';

chai.use(sinonChai);

describe('HistoryPublishService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertSurveyMetadataPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        survey_id: 1,
        submission_uuid: '550e8400-e29b-41d4-a716-446655440000'
      };

      const repoStub = sinon.stub(HistoryPublishRepository.prototype, 'insertSurveyMetadataPublishRecord').resolves(1);

      const response = await service.insertSurveyMetadataPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(1);
    });
  });

  describe('insertSurveyAttachmentPublishRecord', () => {
    it('returns id on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const data = {
        survey_attachment_id: 1,
        artifact_uuid: '123-456-789'
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
        artifact_uuid: '123-456-789'
      };

      const repoStub = sinon
        .stub(HistoryPublishRepository.prototype, 'insertSurveyReportPublishRecord')
        .resolves({ survey_report_publish_id: 1 });

      const response = await service.insertSurveyReportPublishRecord(data);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ survey_report_publish_id: 1 });
    });
  });

  describe('getSurveyMetadataPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = { survey_metadata_publish_id: 1 } as unknown as SurveyMetadataPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveyMetadataPublishRecord')
        .resolves(mockResponse);

      const surveyId = 1;
      const response = await service.getSurveyMetadataPublishRecord(surveyId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('getSurveyAttachmentPublishRecord', () => {
    it('returns history publish record', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = { survey_attachment_publish_id: 1 } as unknown as SurveyAttachmentPublish;
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

      const mockResponse = { survey_report_publish_id: 1 } as unknown as SurveyReportPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'getSurveyReportPublishRecord')
        .resolves(mockResponse);

      const surveyReportAttachmentId = 1;
      const response = await service.getSurveyReportPublishRecord(surveyReportAttachmentId);

      expect(repositoryStub).to.be.calledOnce;
      expect(response).to.eql(mockResponse);
    });
  });

  describe('findSurveyMetadataPublishRecordBySubmissionUuid', () => {
    it('returns record when repository returns one', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const mockResponse = {
        survey_metadata_publish_id: 1,
        survey_id: 2,
        submission_uuid: '550e8400-e29b-41d4-a716-446655440000'
      } as unknown as SurveyMetadataPublish;
      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves(mockResponse);

      const submissionUuid = '550e8400-e29b-41d4-a716-446655440000';
      const response = await service.findSurveyMetadataPublishRecordBySubmissionUuid(submissionUuid);

      expect(repositoryStub).to.be.calledOnceWith(submissionUuid);
      expect(response).to.eql(mockResponse);
    });

    it('returns null when repository returns null', async () => {
      const dbConnection = getMockDBConnection();
      const service = new HistoryPublishService(dbConnection);

      const repositoryStub = sinon
        .stub(HistoryPublishRepository.prototype, 'findSurveyMetadataPublishRecordBySubmissionUuid')
        .resolves(null);

      const submissionUuid = '550e8400-e29b-41d4-a716-446655440000';
      const response = await service.findSurveyMetadataPublishRecordBySubmissionUuid(submissionUuid);

      expect(repositoryStub).to.be.calledOnceWith(submissionUuid);
      expect(response).to.be.null;
    });
  });
});
