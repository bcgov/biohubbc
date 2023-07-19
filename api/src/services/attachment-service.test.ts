import AWS from 'aws-sdk';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ATTACHMENT_TYPE } from '../constants/attachments';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/project-survey-attachments';
import {
  AttachmentRepository,
  IProjectAttachment,
  IProjectReportAttachment,
  IReportAttachmentAuthor,
  ISurveyAttachment,
  ISurveyReportAttachment
} from '../repositories/attachment-repository';
import {
  ProjectAttachmentPublish,
  ProjectReportPublish,
  SurveyAttachmentPublish,
  SurveyReportPublish
} from '../repositories/history-publish-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
import { HistoryPublishService } from './history-publish-service';
import { PlatformService } from './platform-service';

chai.use(sinonChai);

describe('AttachmentService', () => {
  const S3_KEY_PREFIX = process.env.S3_KEY_PREFIX;

  beforeEach(() => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';
  });

  afterEach(() => {
    process.env.S3_KEY_PREFIX = S3_KEY_PREFIX;

    sinon.restore();
  });

  describe('Project', () => {
    describe('Attachment', () => {
      describe('getProjectAttachments', () => {
        it('should return IProjectAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [({ id: 1 } as unknown) as IProjectAttachment];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectAttachments').resolves(data);

          const response = await service.getProjectAttachments(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getProjectAttachmentsWithSupplementaryData', async () => {
        it('should return a project attachment with supplementary data', async () => {
          const dbConnection = getMockDBConnection();

          const attachmentService = new AttachmentService(dbConnection);

          const attachmentData = [
            ({ project_attachment_id: 1, file_type: 'Attachment' } as unknown) as IProjectAttachment
          ];

          const supplementaryData = ({ project_attachment_publish_id: 1 } as unknown) as ProjectAttachmentPublish;

          const attachmentRepoStub = sinon
            .stub(AttachmentRepository.prototype, 'getProjectAttachments')
            .resolves(attachmentData);

          const supplementaryDataStub = sinon
            .stub(HistoryPublishService.prototype, 'getProjectAttachmentPublishRecord')
            .resolves(supplementaryData);

          const response = await attachmentService.getProjectAttachmentsWithSupplementaryData(1);

          expect(attachmentRepoStub).to.be.calledOnce;
          expect(supplementaryDataStub).to.be.calledOnce;
          expect(response[0].id).to.eql(attachmentData[0].project_attachment_id);
          expect(response[0].supplementaryAttachmentData).to.eql(supplementaryData);
        });
      });

      describe('getProjectReportAttachmentsWithSupplementaryData', async () => {
        it('should return a project attachment with supplementary data', async () => {
          const dbConnection = getMockDBConnection();

          const attachmentService = new AttachmentService(dbConnection);

          const attachmentData = [({ project_report_attachment_id: 1 } as unknown) as IProjectReportAttachment];

          const supplementaryData = ({ project_report_publish_id: 1 } as unknown) as ProjectReportPublish;

          const attachmentRepoStub = sinon
            .stub(AttachmentRepository.prototype, 'getProjectReportAttachments')
            .resolves(attachmentData);

          const supplementaryDataStub = sinon
            .stub(HistoryPublishService.prototype, 'getProjectReportPublishRecord')
            .resolves(supplementaryData);

          const response = await attachmentService.getProjectReportAttachmentsWithSupplementaryData(1);

          expect(attachmentRepoStub).to.be.calledOnce;
          expect(supplementaryDataStub).to.be.calledOnce;
          expect(response[0].id).to.eql(attachmentData[0].project_report_attachment_id);
          expect(response[0].supplementaryAttachmentData).to.eql(supplementaryData);
        });
      });

      describe('getSurveyAttachmentsWithSupplementaryData', async () => {
        it('should return a survey attachment with supplementary data', async () => {
          const dbConnection = getMockDBConnection();

          const attachmentService = new AttachmentService(dbConnection);

          const attachmentData = [
            ({ survey_attachment_id: 1, file_type: 'Attachment' } as unknown) as ISurveyAttachment
          ];

          const supplementaryData = ({ survey_attachment_publish_id: 1 } as unknown) as SurveyAttachmentPublish;

          const attachmentRepoStub = sinon
            .stub(AttachmentRepository.prototype, 'getSurveyAttachments')
            .resolves(attachmentData);

          const supplementaryDataStub = sinon
            .stub(HistoryPublishService.prototype, 'getSurveyAttachmentPublishRecord')
            .resolves(supplementaryData);

          const response = await attachmentService.getSurveyAttachmentsWithSupplementaryData(1);

          expect(attachmentRepoStub).to.be.calledOnce;
          expect(supplementaryDataStub).to.be.calledOnce;
          expect(response[0].id).to.eql(attachmentData[0].survey_attachment_id);
          expect(response[0].supplementaryAttachmentData).to.eql(supplementaryData);
        });
      });

      describe('getSurveyReportAttachmentsWithSupplementaryData', async () => {
        it('should return a survey report with supplementary data', async () => {
          const dbConnection = getMockDBConnection();

          const attachmentService = new AttachmentService(dbConnection);

          const attachmentData = [({ survey_report_attachment_id: 1 } as unknown) as ISurveyReportAttachment];

          const supplementaryData = ({ survey_report_publish_id: 1 } as unknown) as SurveyReportPublish;

          const attachmentRepoStub = sinon
            .stub(AttachmentRepository.prototype, 'getSurveyReportAttachments')
            .resolves(attachmentData);

          const supplementaryDataStub = sinon
            .stub(HistoryPublishService.prototype, 'getSurveyReportPublishRecord')
            .resolves(supplementaryData);

          const response = await attachmentService.getSurveyReportAttachmentsWithSupplementaryData(1);

          expect(attachmentRepoStub).to.be.calledOnce;
          expect(supplementaryDataStub).to.be.calledOnce;
          expect(response[0].id).to.eql(attachmentData[0].survey_report_attachment_id);
          expect(response[0].supplementaryAttachmentData).to.eql(supplementaryData);
        });
      });

      describe('getProjectAttachmentById', () => {
        it('should return IProjectAttachment', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as IProjectAttachment;

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectAttachmentById').resolves(data);

          const response = await service.getProjectAttachmentById(1, 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getProjectAttachmentsByIds', () => {
        it('should return IProjectAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ([{ id: 1 }, { id: 2 }] as unknown) as IProjectAttachment[];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectAttachmentsByIds').resolves(data);

          const response = await service.getProjectAttachmentsByIds(1, [1, 2]);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('insertProjectAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { project_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'insertProjectAttachment').resolves(data);

          const response = await service.insertProjectAttachment(
            ({} as unknown) as Express.Multer.File,
            1,
            'string',
            'string'
          );

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('updateProjectAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { project_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'updateProjectAttachment').resolves(data);

          const response = await service.updateProjectAttachment('string', 1, 'string');

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getProjectAttachmentByFileName', () => {
        it('should return QueryResult', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as QueryResult;

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectAttachmentByFileName').resolves(data);

          const response = await service.getProjectAttachmentByFileName('string', 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('upsertProjectAttachment', () => {
        it('should update and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateProjectAttachment')
            .resolves({ project_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertProjectAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            'string'
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(response).to.eql({
            project_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/file.test'
          });
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertProjectAttachment')
            .resolves({ project_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertProjectAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            'string'
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(response).to.eql({
            project_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/file.test'
          });
        });
      });

      describe('getProjectAttachmentS3Key', () => {
        it('should return s3 key', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = 'key';

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectAttachmentS3Key').resolves(data);

          const response = await service.getProjectAttachmentS3Key(1, 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteProjectAttachment', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteProjectAttachment').resolves(data);

          const response = await service.deleteProjectAttachment(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('handleDeleteProjectAttachment', () => {
        describe('delete report attachment', () => {
          it('should run without issue', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getProjectReportStub = sinon
              .stub(AttachmentService.prototype, 'getProjectReportAttachmentById')
              .resolves(({
                key: 'key',
                uuid: 'uuid',
                project_report_attachment_id: 1
              } as unknown) as IProjectReportAttachment);
            const deleteProjectReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
              .resolves();
            const deleteProjectReportAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachment')
              .resolves();
            const getProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getProjectAttachmentById')
              .resolves();
            const deleteProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectAttachment')
              .resolves();

            const getProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectReportPublishRecord')
              .resolves(({
                survey_report_publish_id: 1
              } as unknown) as ProjectReportPublish);
            const getProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectAttachmentPublishRecord')
              .resolves(({
                survey_report_publish_id: 1
              } as unknown) as ProjectAttachmentPublish);
            const deleteProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectAttachmentPublishRecord')
              .resolves();
            const deleteProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectReportAttachmentPublishRecord')
              .resolves();

            const deleteFromBioHubStub = sinon.stub(PlatformService.prototype, 'deleteAttachmentFromBiohub').resolves();

            const mockS3Client = new AWS.S3();
            sinon.stub(AWS, 'S3').returns(mockS3Client);
            const deleteS3 = sinon.stub(mockS3Client, 'deleteObject').returns({
              promise: () =>
                Promise.resolve({
                  DeleteMarker: true
                })
            } as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>);

            await service.handleDeleteProjectAttachment(1, 1, ATTACHMENT_TYPE.REPORT, true);

            expect(getProjectReportStub).to.be.called;
            expect(getProjectReportPublishStub).to.be.called;
            expect(deleteProjectReportPublishStub).to.be.called;
            expect(deleteProjectReportAuthorsStub).to.be.called;
            expect(deleteProjectReportAttachmentStub).to.be.called;
            expect(deleteFromBioHubStub).to.be.called;
            expect(deleteS3).to.be.called;

            expect(deleteProjectAttachmentStub).to.not.be.called;
            expect(getProjectAttachmentStub).to.not.be.called;
            expect(getProjectPublishStub).to.not.be.called;
            expect(deleteProjectPublishStub).to.not.be.called;
          });

          it('should run without sending delete request to BioHub', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getProjectReportStub = sinon
              .stub(AttachmentService.prototype, 'getProjectReportAttachmentById')
              .resolves(({
                key: 'key',
                uuid: 'uuid',
                project_report_attachment_id: 1
              } as unknown) as IProjectReportAttachment);
            const deleteProjectReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
              .resolves();
            const deleteProjectReportAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachment')
              .resolves();
            const getProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getProjectAttachmentById')
              .resolves();
            const deleteProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectAttachment')
              .resolves();

            const getProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectReportPublishRecord')
              .resolves(null);
            const getProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectAttachmentPublishRecord')
              .resolves(({
                project_report_publish_id: 1
              } as unknown) as ProjectAttachmentPublish);
            const deleteProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectAttachmentPublishRecord')
              .resolves();
            const deleteProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectReportAttachmentPublishRecord')
              .resolves();

            const deleteFromBioHubStub = sinon.stub(PlatformService.prototype, 'deleteAttachmentFromBiohub').resolves();

            const mockS3Client = new AWS.S3();
            sinon.stub(AWS, 'S3').returns(mockS3Client);
            const deleteS3 = sinon.stub(mockS3Client, 'deleteObject').returns({
              promise: () =>
                Promise.resolve({
                  DeleteMarker: true
                })
            } as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>);

            await service.handleDeleteProjectAttachment(1, 1, ATTACHMENT_TYPE.REPORT, false);

            expect(getProjectReportStub).to.be.called;
            expect(getProjectReportPublishStub).to.be.called;
            expect(deleteProjectReportPublishStub).to.be.called;
            expect(deleteProjectReportAuthorsStub).to.be.called;
            expect(deleteProjectReportAttachmentStub).to.be.called;
            expect(deleteS3).to.be.called;

            expect(deleteFromBioHubStub).to.not.be.called;
            expect(deleteProjectAttachmentStub).to.not.be.called;
            expect(getProjectAttachmentStub).to.not.be.called;
            expect(getProjectPublishStub).to.not.be.called;
            expect(deleteProjectPublishStub).to.not.be.called;
          });
        });

        describe('delete other attachment', () => {
          it('should run without issue', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getProjectReportStub = sinon
              .stub(AttachmentService.prototype, 'getProjectReportAttachmentById')
              .resolves(({
                key: 'key',
                uuid: 'uuid',
                project_report_attachment_id: 1
              } as unknown) as IProjectReportAttachment);
            const deleteProjectReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
              .resolves();
            const deleteProjectReportAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachment')
              .resolves();
            const getProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getProjectAttachmentById')
              .resolves(({
                key: 'key',
                uuid: 'uuid',
                project_attachment_id: 1
              } as unknown) as IProjectAttachment);
            const deleteProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectAttachment')
              .resolves();

            const getProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectReportPublishRecord')
              .resolves(({
                survey_report_publish_id: 1
              } as unknown) as ProjectReportPublish);
            const getProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectAttachmentPublishRecord')
              .resolves(({
                survey_report_publish_id: 1
              } as unknown) as ProjectAttachmentPublish);
            const deleteProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectAttachmentPublishRecord')
              .resolves();
            const deleteProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectReportAttachmentPublishRecord')
              .resolves();

            const deleteFromBioHubStub = sinon.stub(PlatformService.prototype, 'deleteAttachmentFromBiohub').resolves();

            const mockS3Client = new AWS.S3();
            sinon.stub(AWS, 'S3').returns(mockS3Client);
            const deleteS3 = sinon.stub(mockS3Client, 'deleteObject').returns({
              promise: () =>
                Promise.resolve({
                  DeleteMarker: true
                })
            } as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>);

            await service.handleDeleteProjectAttachment(1, 1, ATTACHMENT_TYPE.OTHER, true);

            expect(getProjectAttachmentStub).to.be.called;
            expect(getProjectPublishStub).to.be.called;
            expect(deleteProjectPublishStub).to.be.called;
            expect(deleteProjectAttachmentStub).to.be.called;
            expect(deleteFromBioHubStub).to.be.called;
            expect(deleteS3).to.be.called;

            expect(getProjectReportStub).to.not.be.called;
            expect(getProjectReportPublishStub).to.not.be.called;
            expect(deleteProjectReportPublishStub).to.not.be.called;
            expect(deleteProjectReportAuthorsStub).to.not.be.called;
            expect(deleteProjectReportAttachmentStub).to.not.be.called;
          });

          it('should run without sending delete request to BioHub', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getProjectReportStub = sinon
              .stub(AttachmentService.prototype, 'getProjectReportAttachmentById')
              .resolves(({
                key: 'key',
                uuid: 'uuid',
                project_report_attachment_id: 1
              } as unknown) as IProjectReportAttachment);
            const deleteProjectReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
              .resolves();
            const deleteProjectReportAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachment')
              .resolves();
            const getProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getProjectAttachmentById')
              .resolves(({
                key: 'key',
                uuid: 'uuid',
                project_attachment_id: 1
              } as unknown) as IProjectAttachment);
            const deleteProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectAttachment')
              .resolves();

            const getProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectReportPublishRecord')
              .resolves(null);
            const getProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'getProjectAttachmentPublishRecord')
              .resolves(null);
            const deleteProjectPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectAttachmentPublishRecord')
              .resolves();
            const deleteProjectReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteProjectReportAttachmentPublishRecord')
              .resolves();

            const deleteFromBioHubStub = sinon.stub(PlatformService.prototype, 'deleteAttachmentFromBiohub').resolves();

            const mockS3Client = new AWS.S3();
            sinon.stub(AWS, 'S3').returns(mockS3Client);
            const deleteS3 = sinon.stub(mockS3Client, 'deleteObject').returns({
              promise: () =>
                Promise.resolve({
                  DeleteMarker: true
                })
            } as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>);

            await service.handleDeleteProjectAttachment(1, 1, ATTACHMENT_TYPE.OTHER, true);

            expect(getProjectAttachmentStub).to.be.called;
            expect(getProjectPublishStub).to.be.called;
            expect(deleteProjectPublishStub).to.be.called;
            expect(deleteProjectAttachmentStub).to.be.called;
            expect(deleteS3).to.be.called;

            expect(getProjectReportStub).to.not.be.called;
            expect(getProjectReportPublishStub).to.not.be.called;
            expect(deleteProjectReportPublishStub).to.not.be.called;
            expect(deleteProjectReportAuthorsStub).to.not.be.called;
            expect(deleteProjectReportAttachmentStub).to.not.be.called;
            expect(deleteFromBioHubStub).to.not.be.called;
          });
        });
      });
    });

    describe('Report Attachment', () => {
      describe('getProjectReportAttachments', () => {
        it('should return IProjectReportAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [({ id: 1 } as unknown) as IProjectReportAttachment];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectReportAttachments').resolves(data);

          const response = await service.getProjectReportAttachments(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getProjectReportAttachmentById', () => {
        it('should return IProjectReportAttachment', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as IProjectReportAttachment;

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectReportAttachmentById').resolves(data);

          const response = await service.getProjectReportAttachmentById(1, 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getProjectReportAttachmentsByIds', () => {
        it('should return IProjectReportAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ([{ id: 1 }, { id: 2 }] as unknown) as IProjectReportAttachment[];

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'getProjectReportAttachmentsByIds')
            .resolves(data);

          const response = await service.getProjectReportAttachmentsByIds(1, [1, 2]);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getProjectReportAttachmentAuthors', () => {
        it('should return IReportAttachmentAuthor[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [({ id: 1 } as unknown) as IReportAttachmentAuthor];

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'getProjectReportAttachmentAuthors')
            .resolves(data);

          const response = await service.getProjectReportAttachmentAuthors(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('insertProjectReportAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { project_report_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'insertProjectReportAttachment').resolves(data);

          const response = await service.insertProjectReportAttachment(
            'string',
            1,
            1,
            ({ title: 'string' } as unknown) as PostReportAttachmentMetadata,
            'string'
          );

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('updateProjectReportAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { project_report_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'updateProjectReportAttachment').resolves(data);

          const response = await service.updateProjectReportAttachment('string', 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteProjectReportAttachmentAuthors', () => {
        it('should call once and return void', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as QueryResult;

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'deleteProjectReportAttachmentAuthors')
            .resolves(data);

          const response = await service.deleteProjectReportAttachmentAuthors(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('insertProjectReportAttachmentAuthor', () => {
        it('should call once and return void', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'insertProjectReportAttachmentAuthor').resolves();

          const response = await service.insertProjectReportAttachmentAuthor(1, {
            first_name: 'first',
            last_name: 'last'
          });

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(undefined);
        });
      });

      describe('getProjectReportAttachmentByFileName', () => {
        it('should return QueryResult', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as QueryResult;

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'getProjectReportAttachmentByFileName')
            .resolves(data);

          const response = await service.getProjectReportAttachmentByFileName(1, 'string');

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('upsertProjectReportAttachment', () => {
        it('should update and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectReportAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateProjectReportAttachment')
            .resolves({ project_report_attachment_id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon
            .stub(AttachmentService.prototype, 'insertProjectReportAttachmentAuthor')
            .resolves();

          const response = await service.upsertProjectReportAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            {
              title: 'string',
              authors: [{ first_name: 'first', last_name: 'last' }]
            }
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(response).to.eql({
            project_report_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/reports/file.test'
          });
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectReportAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertProjectReportAttachment')
            .resolves({ project_report_attachment_id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon
            .stub(AttachmentService.prototype, 'insertProjectReportAttachmentAuthor')
            .resolves();

          const response = await service.upsertProjectReportAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            {
              title: 'string',
              authors: [{ first_name: 'first', last_name: 'last' }]
            }
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(response).to.eql({
            project_report_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/reports/file.test'
          });
        });
      });

      describe('getProjectReportAttachmentS3Key', () => {
        it('should return s3 key', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = 'key';

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectReportAttachmentS3Key').resolves(data);

          const response = await service.getProjectReportAttachmentS3Key(1, 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('updateProjectReportAttachmentMetadata', () => {
        it('should return void', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'updateProjectReportAttachmentMetadata')
            .resolves();

          const response = await service.updateProjectReportAttachmentMetadata(1, 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(undefined);
        });
      });

      describe('deleteProjectReportAttachment', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteProjectReportAttachment').resolves(data);

          const response = await service.deleteProjectReportAttachment(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });
    });
  });

  describe('Survey', () => {
    describe('Attachment', () => {
      describe('getSurveyAttachments', () => {
        it('should return ISurveyAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [({ id: 1 } as unknown) as ISurveyAttachment];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyAttachments').resolves(data);

          const response = await service.getSurveyAttachments(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyAttachmentsByIds', () => {
        it('should return ISurveyAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ([{ id: 1 }, { id: 2 }] as unknown) as ISurveyAttachment[];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyAttachmentsByIds').resolves(data);

          const response = await service.getSurveyAttachmentsByIds(1, [1, 2]);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteSurveyAttachment', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteSurveyAttachment').resolves(data);

          const response = await service.deleteSurveyAttachment(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('handleDeleteSurveyAttachment', () => {
        describe('delete other attachment', () => {
          it('should run without issue', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getSurveyAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyAttachmentById')
              .resolves(({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3/key'
              } as unknown) as ISurveyAttachment);
            const reportPublishStatusStub = sinon
              .stub(HistoryPublishService.prototype, 'getSurveyReportPublishRecord')
              .resolves(({
                survey_report_publish_id: 1
              } as unknown) as SurveyReportPublish);
            const attachmentPublishStatusStub = sinon
              .stub(HistoryPublishService.prototype, 'getSurveyAttachmentPublishRecord')
              .resolves(({
                survey_attachment_publish_id: 1
              } as unknown) as SurveyAttachmentPublish);
            const deleteSurveyReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteSurveyReportAttachmentPublishRecord')
              .resolves();
            const attachmentPublishDeleteStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteSurveyAttachmentPublishRecord')
              .resolves();
            const deleteSurveyReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
              .resolves();
            const deleteSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'deleteSurveyReportAttachment')
              .resolves();

            const deleteSurveyAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'deleteSurveyAttachment')
              .resolves();

            const getSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyReportAttachmentById')
              .resolves(({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3/key'
              } as unknown) as ISurveyReportAttachment);

            const deleteFromBioHubStub = sinon.stub(PlatformService.prototype, 'deleteAttachmentFromBiohub').resolves();

            const mockS3Client = new AWS.S3();
            sinon.stub(AWS, 'S3').returns(mockS3Client);
            const deleteS3 = sinon.stub(mockS3Client, 'deleteObject').returns({
              promise: () =>
                Promise.resolve({
                  DeleteMarker: true
                })
            } as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>);

            await service.handleDeleteSurveyAttachment(1, 1, ATTACHMENT_TYPE.OTHER, true);

            expect(getSurveyAttachmentStub).to.be.called;
            expect(attachmentPublishStatusStub).to.be.called;
            expect(attachmentPublishDeleteStub).to.be.called;
            expect(deleteSurveyAttachmentStub).to.be.called;
            expect(deleteFromBioHubStub).to.be.called;
            expect(deleteS3).to.be.called;

            expect(getSurveyReportStub).to.be.not.called;
            expect(reportPublishStatusStub).to.be.not.called;
            expect(deleteSurveyReportPublishStub).to.be.not.called;
            expect(deleteSurveyReportAuthorsStub).to.be.not.called;
            expect(deleteSurveyReportStub).to.be.not.called;
          });
        });

        describe('delete report attachment', () => {
          it('should run without issue', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getSurveyAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyAttachmentById')
              .resolves(({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3/key'
              } as unknown) as ISurveyAttachment);
            const reportPublishStatusStub = sinon
              .stub(HistoryPublishService.prototype, 'getSurveyReportPublishRecord')
              .resolves(({
                survey_report_publish_id: 1
              } as unknown) as SurveyReportPublish);
            const attachmentPublishStatusStub = sinon
              .stub(HistoryPublishService.prototype, 'getSurveyAttachmentPublishRecord')
              .resolves(({
                survey_attachment_publish_id: 1
              } as unknown) as SurveyAttachmentPublish);
            const deleteSurveyReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteSurveyReportAttachmentPublishRecord')
              .resolves();
            const attachmentPublishDeleteStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteSurveyAttachmentPublishRecord')
              .resolves();
            const deleteSurveyReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
              .resolves();
            const deleteSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'deleteSurveyReportAttachment')
              .resolves();

            const getSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyReportAttachmentById')
              .resolves(({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3/key'
              } as unknown) as ISurveyReportAttachment);

            const deleteFromBioHubStub = sinon.stub(PlatformService.prototype, 'deleteAttachmentFromBiohub').resolves();

            const mockS3Client = new AWS.S3();
            sinon.stub(AWS, 'S3').returns(mockS3Client);
            const deleteS3 = sinon.stub(mockS3Client, 'deleteObject').returns({
              promise: () =>
                Promise.resolve({
                  DeleteMarker: true
                })
            } as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>);

            await service.handleDeleteSurveyAttachment(1, 1, ATTACHMENT_TYPE.REPORT, true);

            expect(getSurveyReportStub).to.be.called;
            expect(reportPublishStatusStub).to.be.called;
            expect(deleteSurveyReportPublishStub).to.be.called;
            expect(deleteSurveyReportAuthorsStub).to.be.called;
            expect(deleteSurveyReportStub).to.be.called;
            expect(deleteFromBioHubStub).to.be.called;
            expect(deleteS3).to.be.called;

            expect(getSurveyAttachmentStub).to.be.not.called;
            expect(attachmentPublishStatusStub).to.be.not.called;
            expect(attachmentPublishDeleteStub).to.be.not.called;
          });

          it('should not send request to biohub to delete', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getSurveyAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyAttachmentById')
              .resolves(({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3/key'
              } as unknown) as ISurveyAttachment);
            const reportPublishStatusStub = sinon
              .stub(HistoryPublishService.prototype, 'getSurveyReportPublishRecord')
              .resolves(null);
            const attachmentPublishStatusStub = sinon
              .stub(HistoryPublishService.prototype, 'getSurveyAttachmentPublishRecord')
              .resolves(({
                survey_attachment_publish_id: 1
              } as unknown) as SurveyAttachmentPublish);
            const deleteSurveyReportPublishStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteSurveyReportAttachmentPublishRecord')
              .resolves();
            const attachmentPublishDeleteStub = sinon
              .stub(HistoryPublishService.prototype, 'deleteSurveyAttachmentPublishRecord')
              .resolves();
            const deleteSurveyReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
              .resolves();
            const deleteSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'deleteSurveyReportAttachment')
              .resolves();

            const getSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyReportAttachmentById')
              .resolves(({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3/key'
              } as unknown) as ISurveyReportAttachment);

            const deleteFromBioHubStub = sinon.stub(PlatformService.prototype, 'deleteAttachmentFromBiohub').resolves();

            const mockS3Client = new AWS.S3();
            sinon.stub(AWS, 'S3').returns(mockS3Client);
            const deleteS3 = sinon.stub(mockS3Client, 'deleteObject').returns({
              promise: () =>
                Promise.resolve({
                  DeleteMarker: true
                })
            } as AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>);

            await service.handleDeleteSurveyAttachment(1, 1, ATTACHMENT_TYPE.REPORT, false);

            expect(getSurveyReportStub).to.be.called;
            expect(reportPublishStatusStub).to.be.called;
            expect(deleteSurveyReportPublishStub).to.be.called;
            expect(deleteSurveyReportAuthorsStub).to.be.called;
            expect(deleteSurveyReportStub).to.be.called;
            expect(deleteS3).to.be.called;

            expect(deleteFromBioHubStub).to.be.not.called;
            expect(getSurveyAttachmentStub).to.be.not.called;
            expect(attachmentPublishStatusStub).to.be.not.called;
            expect(attachmentPublishDeleteStub).to.be.not.called;
          });
        });
      });

      describe('getSurveyAttachmentS3Key', () => {
        it('should return s3 key', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = 'key';

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyAttachmentS3Key').resolves(data);

          const response = await service.getSurveyAttachmentS3Key(1, 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('updateSurveyAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { survey_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'updateSurveyAttachment').resolves(data);

          const response = await service.updateSurveyAttachment(1, 'string', 'string');

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('insertSurveyAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { survey_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'insertSurveyAttachment').resolves(data);

          const response = await service.insertSurveyAttachment('string', 1, 'string', 1, 'string');

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyAttachmentByFileName', () => {
        it('should return QueryResult', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as QueryResult;

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyAttachmentByFileName').resolves(data);

          const response = await service.getSurveyAttachmentByFileName('string', 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('upsertSurveyAttachment', () => {
        it('should update and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateSurveyAttachment')
            .resolves({ survey_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertSurveyAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            1,
            'string'
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(response).to.eql({
            survey_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/surveys/1/file.test'
          });
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertSurveyAttachment')
            .resolves({ survey_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertSurveyAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            1,
            'string'
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(response).to.eql({
            survey_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/surveys/1/file.test'
          });
        });
      });
    });

    describe('Report Attachment', () => {
      describe('getSurveyReportAttachments', () => {
        it('should return ISurveyReportAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [({ id: 1 } as unknown) as ISurveyReportAttachment];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyReportAttachments').resolves(data);

          const response = await service.getSurveyReportAttachments(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyReportAttachmentById', () => {
        it('should return ISurveyReportAttachment', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as ISurveyReportAttachment;

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyReportAttachmentById').resolves(data);

          const response = await service.getSurveyReportAttachmentById(1, 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyReportAttachmentsByIds', () => {
        it('should return ISurveyReportAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ([{ id: 1 }, { id: 2 }] as unknown) as ISurveyReportAttachment[];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyReportAttachmentsByIds').resolves(data);

          const response = await service.getSurveyReportAttachmentsByIds(1, [1, 2]);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyAttachmentAuthors', () => {
        it('should return IReportAttachmentAuthor[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [({ id: 1 } as unknown) as IReportAttachmentAuthor];

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'getSurveyReportAttachmentAuthors')
            .resolves(data);

          const response = await service.getSurveyAttachmentAuthors(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('insertSurveyReportAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { survey_report_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'insertSurveyReportAttachment').resolves(data);

          const response = await service.insertSurveyReportAttachment(
            'string',
            1,
            1,
            ({ title: 'string' } as unknown) as PostReportAttachmentMetadata,
            'string'
          );

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('updateSurveyReportAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { survey_report_attachment_id: 1, revision_count: 1 };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'updateSurveyReportAttachment').resolves(data);

          const response = await service.updateSurveyReportAttachment('string', 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteSurveyReportAttachmentAuthors', () => {
        it('should call once and return void', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteSurveyReportAttachmentAuthors').resolves();

          const response = await service.deleteSurveyReportAttachmentAuthors(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(undefined);
        });
      });

      describe('insertSurveyReportAttachmentAuthor', () => {
        it('should call once and return void', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'insertSurveyReportAttachmentAuthor').resolves();

          const response = await service.insertSurveyReportAttachmentAuthor(1, {
            first_name: 'first',
            last_name: 'last'
          });

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(undefined);
        });
      });

      describe('getSurveyReportAttachmentByFileName', () => {
        it('should return QueryResult', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = ({ id: 1 } as unknown) as QueryResult;

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(data);

          const response = await service.getSurveyReportAttachmentByFileName(1, 'string');

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('upsertSurveyReportAttachment', () => {
        it('should update and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateSurveyReportAttachment')
            .resolves({ survey_report_attachment_id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon.stub(AttachmentService.prototype, 'insertSurveyReportAttachmentAuthor').resolves();

          const response = await service.upsertSurveyReportAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            1,
            {
              title: 'string',
              authors: [{ first_name: 'first', last_name: 'last' }]
            }
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(response).to.eql({
            survey_report_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/surveys/1/reports/file.test'
          });
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertSurveyReportAttachment')
            .resolves({ survey_report_attachment_id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon.stub(AttachmentService.prototype, 'insertSurveyReportAttachmentAuthor').resolves();

          const response = await service.upsertSurveyReportAttachment(
            ({ originalname: 'file.test' } as unknown) as Express.Multer.File,
            1,
            1,
            {
              title: 'string',
              authors: [{ first_name: 'first', last_name: 'last' }]
            }
          );

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(response).to.eql({
            survey_report_attachment_id: 1,
            revision_count: 1,
            key: 'some/s3/prefix/projects/1/surveys/1/reports/file.test'
          });
        });
      });

      describe('deleteSurveyReportAttachment', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteSurveyReportAttachment').resolves(data);

          const response = await service.deleteSurveyReportAttachment(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyReportAttachmentS3Key', () => {
        it('should return s3 key', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = 'key';

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyReportAttachmentS3Key').resolves(data);

          const response = await service.getSurveyReportAttachmentS3Key(1, 1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('updateSurveyReportAttachmentMetadata', () => {
        it('should return void', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'updateSurveyReportAttachmentMetadata')
            .resolves();

          const response = await service.updateSurveyReportAttachmentMetadata(1, 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(undefined);
        });
      });
    });
  });
});
