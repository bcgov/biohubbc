import { DeleteObjectCommandOutput } from '@aws-sdk/client-s3';
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
  IProjectReportAttachmentAuthor,
  ISurveyAttachment,
  ISurveyReportAttachment,
  ISurveyReportAttachmentAuthor
} from '../repositories/attachment-repository';
import { SurveyAttachmentPublish, SurveyReportPublish } from '../repositories/history-publish-repository';
import { getMockDBConnection } from '../__mocks__/db';
import * as fileUtils from './../utils/file-utils';
import { AttachmentService } from './attachment-service';
import { HistoryPublishService } from './history-publish-service';

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

          const data = [{ id: 1 } as unknown as IProjectAttachment];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getProjectAttachments').resolves(data);

          const response = await service.getProjectAttachments(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyAttachmentsWithSupplementaryData', async () => {
        it('should return a survey attachment with supplementary data', async () => {
          const dbConnection = getMockDBConnection();

          const attachmentService = new AttachmentService(dbConnection);

          const attachmentData = [{ survey_attachment_id: 1, file_type: 'Attachment' } as unknown as ISurveyAttachment];

          const supplementaryData = { survey_attachment_publish_id: 1 } as unknown as SurveyAttachmentPublish;

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

          const attachmentData = [{ survey_report_attachment_id: 1 } as unknown as ISurveyReportAttachment];

          const supplementaryData = { survey_report_publish_id: 1 } as unknown as SurveyReportPublish;

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

          const data = { id: 1 } as unknown as IProjectAttachment;

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

          const data = [{ id: 1 }, { id: 2 }] as unknown as IProjectAttachment[];

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
            {} as unknown as Express.Multer.File,
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

          const data = { id: 1 } as unknown as QueryResult;

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
            .resolves({ rowCount: 1 } as unknown as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateProjectAttachment')
            .resolves({ project_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertProjectAttachment(
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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

        it('should insert and return { id: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectAttachmentByFileName')
            .resolves({ rowCount: 0 } as unknown as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertProjectAttachment')
            .resolves({ project_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertProjectAttachment(
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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

      describe('_deleteProjectAttachmentRecord', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteProjectAttachmentRecord').resolves(data);

          const response = await service._deleteProjectAttachmentRecord(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteProjectAttachment', () => {
        describe('delete report attachment', () => {
          it('should run without issue', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getProjectReportStub = sinon
              .stub(AttachmentService.prototype, 'getProjectReportAttachmentById')
              .resolves({
                key: 's3_key',
                uuid: 'uuid',
                project_report_attachment_id: 1
              } as unknown as IProjectReportAttachment);
            const deleteProjectReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
              .resolves();
            const deleteProjectReportAttachmentStub = sinon
              .stub(AttachmentService.prototype, '_deleteProjectReportAttachmentRecord')
              .resolves();
            const getProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getProjectAttachmentById')
              .resolves();
            const deleteProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, '_deleteProjectAttachmentRecord')
              .resolves();

            const mockDeleteResponse: DeleteObjectCommandOutput = {
              $metadata: {},
              DeleteMarker: true,
              RequestCharged: 'requester',
              VersionId: '123456'
            };
            const deleteFileFromS3Stub = sinon.stub(fileUtils, 'deleteFileFromS3').resolves(mockDeleteResponse);

            await service.deleteProjectAttachment(1, 1, ATTACHMENT_TYPE.REPORT);

            expect(getProjectReportStub).to.be.called;
            expect(deleteProjectReportAuthorsStub).to.be.called;
            expect(deleteProjectReportAttachmentStub).to.be.called;
            expect(deleteFileFromS3Stub).to.be.calledOnceWith('s3_key');

            expect(deleteProjectAttachmentStub).to.not.be.called;
            expect(getProjectAttachmentStub).to.not.be.called;
          });
        });

        describe('delete other attachment', () => {
          it('should run without issue', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getProjectReportStub = sinon
              .stub(AttachmentService.prototype, 'getProjectReportAttachmentById')
              .resolves({
                key: 's3_key',
                uuid: 'uuid',
                project_report_attachment_id: 1
              } as unknown as IProjectReportAttachment);
            const deleteProjectReportAuthorsStub = sinon
              .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
              .resolves();
            const deleteProjectReportAttachmentStub = sinon
              .stub(AttachmentService.prototype, '_deleteProjectReportAttachmentRecord')
              .resolves();
            const getProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getProjectAttachmentById')
              .resolves({
                key: 's3_key',
                uuid: 'uuid',
                project_attachment_id: 1
              } as unknown as IProjectAttachment);
            const deleteProjectAttachmentStub = sinon
              .stub(AttachmentService.prototype, '_deleteProjectAttachmentRecord')
              .resolves();

            const mockDeleteResponse: DeleteObjectCommandOutput = {
              $metadata: {},
              DeleteMarker: true,
              RequestCharged: 'requester',
              VersionId: '123456'
            };
            const deleteFileFromS3Stub = sinon.stub(fileUtils, 'deleteFileFromS3').resolves(mockDeleteResponse);

            await service.deleteProjectAttachment(1, 1, ATTACHMENT_TYPE.OTHER);

            expect(getProjectAttachmentStub).to.be.called;
            expect(deleteProjectAttachmentStub).to.be.called;
            expect(deleteFileFromS3Stub).to.be.calledOnceWith('s3_key');

            expect(getProjectReportStub).to.not.be.called;
            expect(deleteProjectReportAuthorsStub).to.not.be.called;
            expect(deleteProjectReportAttachmentStub).to.not.be.called;
          });
        });
      });
    });

    describe('Report Attachment', () => {
      describe('getProjectReportAttachments', () => {
        it('should return IProjectReportAttachment[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [{ id: 1 } as unknown as IProjectReportAttachment];

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

          const data = { id: 1 } as unknown as IProjectReportAttachment;

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

          const data = [{ id: 1 }, { id: 2 }] as unknown as IProjectReportAttachment[];

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'getProjectReportAttachmentsByIds')
            .resolves(data);

          const response = await service.getProjectReportAttachmentsByIds(1, [1, 2]);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getProjectReportAttachmentAuthors', () => {
        it('should return IProjectReportAttachmentAuthor[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [{ id: 1 } as unknown as IProjectReportAttachmentAuthor];

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
            { title: 'string' } as unknown as PostReportAttachmentMetadata,
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

          const response = await service.updateProjectReportAttachment('string', 1, {
            title: 'string'
          } as unknown as PutReportAttachmentMetadata);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteProjectReportAttachmentAuthors', () => {
        it('should call once and return void', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { id: 1 } as unknown as QueryResult;

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

          const data = { id: 1 } as unknown as QueryResult;

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
            .resolves({ rowCount: 1 } as unknown as QueryResult);

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
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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
            .resolves({ rowCount: 0 } as unknown as QueryResult);

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
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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

          const response = await service.updateProjectReportAttachmentMetadata(1, 1, {
            title: 'string'
          } as unknown as PutReportAttachmentMetadata);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(undefined);
        });
      });

      describe('_deleteProjectReportAttachmentRecord', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'deleteProjectReportAttachmentRecord')
            .resolves(data);

          const response = await service._deleteProjectReportAttachmentRecord(1);

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

          const data = [{ id: 1 } as unknown as ISurveyAttachment];

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

          const data = [{ id: 1 }, { id: 2 }] as unknown as ISurveyAttachment[];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyAttachmentsByIds').resolves(data);

          const response = await service.getSurveyAttachmentsByIds(1, [1, 2]);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('_deleteSurveyAttachmentRecord', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteSurveyAttachmentRecord').resolves(data);

          const response = await service._deleteSurveyAttachmentRecord(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteSurveyAttachment', () => {
        describe('delete other attachment', () => {
          it('should run without issue', async () => {
            const dbConnection = getMockDBConnection();
            const service = new AttachmentService(dbConnection);

            const getSurveyAttachmentStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyAttachmentById')
              .resolves({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3_key'
              } as unknown as ISurveyAttachment);
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
              .stub(AttachmentService.prototype, '_deleteSurveyReportAttachmentRecord')
              .resolves();

            const deleteSurveyAttachmentStub = sinon
              .stub(AttachmentService.prototype, '_deleteSurveyAttachmentRecord')
              .resolves();

            const getSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyReportAttachmentById')
              .resolves({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3_key'
              } as unknown as ISurveyReportAttachment);

            const mockDeleteResponse: DeleteObjectCommandOutput = {
              $metadata: {},
              DeleteMarker: true,
              RequestCharged: 'requester',
              VersionId: '123456'
            };
            const deleteFileFromS3Stub = sinon.stub(fileUtils, 'deleteFileFromS3').resolves(mockDeleteResponse);

            await service.deleteSurveyAttachment(1, 1, ATTACHMENT_TYPE.OTHER);

            expect(getSurveyAttachmentStub).to.be.called;
            expect(attachmentPublishDeleteStub).to.be.called;
            expect(deleteSurveyAttachmentStub).to.be.called;
            expect(deleteFileFromS3Stub).to.be.calledOnceWith('s3_key');

            expect(getSurveyReportStub).to.be.not.called;
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
              .resolves({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3_key'
              } as unknown as ISurveyAttachment);
            const attachmentPublishStatusStub = sinon
              .stub(HistoryPublishService.prototype, 'getSurveyAttachmentPublishRecord')
              .resolves({
                survey_attachment_publish_id: 1
              } as unknown as SurveyAttachmentPublish);
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
              .stub(AttachmentService.prototype, '_deleteSurveyReportAttachmentRecord')
              .resolves();

            const getSurveyReportStub = sinon
              .stub(AttachmentService.prototype, 'getSurveyReportAttachmentById')
              .resolves({
                survey_report_attachment_id: 1,
                survey_attachment_id: 1,
                uuid: 'uuid',
                key: 's3_key'
              } as unknown as ISurveyReportAttachment);

            const mockDeleteResponse: DeleteObjectCommandOutput = {
              $metadata: {},
              DeleteMarker: true,
              RequestCharged: 'requester',
              VersionId: '123456'
            };
            const deleteFileFromS3Stub = sinon.stub(fileUtils, 'deleteFileFromS3').resolves(mockDeleteResponse);

            await service.deleteSurveyAttachment(1, 1, ATTACHMENT_TYPE.REPORT);

            expect(getSurveyReportStub).to.be.called;
            expect(deleteSurveyReportPublishStub).to.be.called;
            expect(deleteSurveyReportAuthorsStub).to.be.called;
            expect(deleteSurveyReportStub).to.be.called;
            expect(deleteFileFromS3Stub).to.be.calledOnceWith('s3_key');

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

          const data = { id: 1 } as unknown as QueryResult;

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
            .stub(AttachmentService.prototype, 'getSurveyAttachmentByFileName')
            .resolves({ rowCount: 1 } as unknown as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateSurveyAttachment')
            .resolves({ survey_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertSurveyAttachment(
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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
            .stub(AttachmentService.prototype, 'getSurveyAttachmentByFileName')
            .resolves({ rowCount: 0 } as unknown as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertSurveyAttachment')
            .resolves({ survey_attachment_id: 1, revision_count: 1 });

          const response = await service.upsertSurveyAttachment(
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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

          const data = [{ id: 1 } as unknown as ISurveyReportAttachment];

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

          const data = { id: 1 } as unknown as ISurveyReportAttachment;

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

          const data = [{ id: 1 }, { id: 2 }] as unknown as ISurveyReportAttachment[];

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'getSurveyReportAttachmentsByIds').resolves(data);

          const response = await service.getSurveyReportAttachmentsByIds(1, [1, 2]);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('getSurveyAttachmentAuthors', () => {
        it('should return ISurveyReportAttachmentAuthor[]', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = [{ id: 1 } as unknown as ISurveyReportAttachmentAuthor];

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
            { title: 'string' } as unknown as PostReportAttachmentMetadata,
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

          const response = await service.updateSurveyReportAttachment('string', 1, {
            title: 'string'
          } as unknown as PutReportAttachmentMetadata);

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

          const data = { id: 1 } as unknown as QueryResult;

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
            .resolves({ rowCount: 1 } as unknown as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateSurveyReportAttachment')
            .resolves({ survey_report_attachment_id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon.stub(AttachmentService.prototype, 'insertSurveyReportAttachmentAuthor').resolves();

          const response = await service.upsertSurveyReportAttachment(
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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
            .resolves({ rowCount: 0 } as unknown as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertSurveyReportAttachment')
            .resolves({ survey_report_attachment_id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon.stub(AttachmentService.prototype, 'insertSurveyReportAttachmentAuthor').resolves();

          const response = await service.upsertSurveyReportAttachment(
            { originalname: 'file.test' } as unknown as Express.Multer.File,
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

      describe('_deleteSurveyReportAttachmentRecord', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'string', uuid: 'string' };

          const repoStub = sinon
            .stub(AttachmentRepository.prototype, 'deleteSurveyReportAttachmentRecord')
            .resolves(data);

          const response = await service._deleteSurveyReportAttachmentRecord(1);

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

          const response = await service.updateSurveyReportAttachmentMetadata(1, 1, {
            title: 'string'
          } as unknown as PutReportAttachmentMetadata);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(undefined);
        });
      });
    });
  });
});
