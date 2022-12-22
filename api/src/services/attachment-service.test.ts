import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/project-survey-attachments';
import {
  AttachmentRepository,
  IProjectAttachment,
  IProjectReportAttachment,
  IReportAttachmentAuthor,
  ISurveyAttachment,
  ISurveyReportAttachment
} from '../repositories/attachment-repository';
import * as file_utils from '../utils/file-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { AttachmentService } from './attachment-service';
chai.use(sinonChai);

describe('AttachmentService', () => {
  afterEach(() => {
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

      describe('insertProjectAttachment', () => {
        it('should return { id: number; revision_count: number }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateProjectAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const response = await service.upsertProjectAttachment(({} as unknown) as Express.Multer.File, 1, 'string');

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertProjectAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const response = await service.upsertProjectAttachment(({} as unknown) as Express.Multer.File, 1, 'string');

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
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

          const data = { key: 'key' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteProjectAttachment').resolves(data);

          const response = await service.deleteProjectAttachment(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
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

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectReportAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateProjectReportAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon
            .stub(AttachmentService.prototype, 'insertProjectReportAttachmentAuthor')
            .resolves();

          const response = await service.upsertProjectReportAttachment(({} as unknown) as Express.Multer.File, 1, {
            title: 'string',
            authors: [{ first_name: 'first', last_name: 'last' }]
          });

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getProjectReportAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertProjectReportAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon
            .stub(AttachmentService.prototype, 'insertProjectReportAttachmentAuthor')
            .resolves();

          const response = await service.upsertProjectReportAttachment(({} as unknown) as Express.Multer.File, 1, {
            title: 'string',
            authors: [{ first_name: 'first', last_name: 'last' }]
          });

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
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

          const data = { key: 'key' };

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

      describe('deleteSurveyAttachment', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'key' };

          const repoStub = sinon.stub(AttachmentRepository.prototype, 'deleteSurveyAttachment').resolves(data);

          const response = await service.deleteSurveyAttachment(1);

          expect(repoStub).to.be.calledOnce;
          expect(response).to.eql(data);
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

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateSurveyAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const response = await service.upsertSurveyAttachment(({} as unknown) as Express.Multer.File, 1, 1, 'string');

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertSurveyAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const response = await service.upsertSurveyAttachment(({} as unknown) as Express.Multer.File, 1, 1, 'string');

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
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

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1 };

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

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 1 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'updateSurveyReportAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon.stub(AttachmentService.prototype, 'insertSurveyReportAttachmentAuthor').resolves();

          const response = await service.upsertSurveyReportAttachment(({} as unknown) as Express.Multer.File, 1, 1, {
            title: 'string',
            authors: [{ first_name: 'first', last_name: 'last' }]
          });

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });

        it('should insert and return { id: number; revision_count: number; key: string }', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { id: 1, revision_count: 1, key: 'key' };

          const fileStub = sinon.stub(file_utils, 'generateS3FileKey').returns('key');

          const serviceStub1 = sinon
            .stub(AttachmentService.prototype, 'getSurveyReportAttachmentByFileName')
            .resolves(({ rowCount: 0 } as unknown) as QueryResult);

          const serviceStub2 = sinon
            .stub(AttachmentService.prototype, 'insertSurveyReportAttachment')
            .resolves({ id: 1, revision_count: 1 });

          const serviceStub3 = sinon
            .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
            .resolves();

          const serviceStub4 = sinon.stub(AttachmentService.prototype, 'insertSurveyReportAttachmentAuthor').resolves();

          const response = await service.upsertSurveyReportAttachment(({} as unknown) as Express.Multer.File, 1, 1, {
            title: 'string',
            authors: [{ first_name: 'first', last_name: 'last' }]
          });

          expect(serviceStub1).to.be.calledOnce;
          expect(serviceStub2).to.be.calledOnce;
          expect(serviceStub3).to.be.calledOnce;
          expect(serviceStub4).to.be.calledOnce;
          expect(fileStub).to.be.calledOnce;
          expect(response).to.eql(data);
        });
      });

      describe('deleteSurveyReportAttachment', () => {
        it('should return key string', async () => {
          const dbConnection = getMockDBConnection();
          const service = new AttachmentService(dbConnection);

          const data = { key: 'key' };

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
