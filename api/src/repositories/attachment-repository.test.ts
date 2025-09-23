import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/survey-attachments';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { getMockDBConnection } from '../__mocks__/db';

chai.use(sinonChai);

describe('AttachmentRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('Survey', () => {
    describe('Attachment', () => {
      describe('getSurveyAttachments', () => {
        it('should return rows', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachments(1);

          expect(response).to.eql([{ id: 1 }]);
        });

        it('should return empty rows', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachments(1);

          expect(response).to.eql([]);
        });
      });

      describe('getSurveyAttachmentsByIds', () => {
        it('should return rows', async () => {
          const mockResponse = { rows: [{ id: 1 }, { id: 2 }], rowCount: 2 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentsByIds(1, [1, 2]);

          expect(response).to.eql([{ id: 1 }, { id: 2 }]);
        });
      });

      describe('deleteSurveyAttachmentRecord', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteSurveyAttachmentRecord(1);

          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteSurveyAttachmentRecord(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete Survey Attachment');
          }
        });
      });

      describe('getSurveyAttachmentS3Key', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ key: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentS3Key(1, 1);

          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyAttachmentS3Key(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get Survey Attachment S3 key');
          }
        });
      });

      describe('updateSurveyAttachment', () => {
        it('should return row', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateSurveyAttachment(1, 'string', 'string');

          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateSurveyAttachment(1, 'string', 'string');
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update survey attachment data');
          }
        });
      });

      describe('insertSurveyAttachment', () => {
        it('should return row', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertSurveyAttachment('string', 1, 'string', 1, 'string');

          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.insertSurveyAttachment('string', 1, 'string', 1, 'string');
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to insert survey attachment data');
          }
        });
      });

      describe('getSurveyAttachmentByFileName', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentByFileName('string', 1);

          expect(response).to.eql({ rows: [{ id: 1 }], rowCount: 1 });
        });
      });
    });

    describe('Report Attachment', () => {
      describe('getSurveyReportAttachments', () => {
        it('should return rows', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachments(1);

          expect(response).to.eql([{ id: 1 }]);
        });

        it('should return empty rows', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachments(1);

          expect(response).to.eql([]);
        });
      });

      describe('getSurveyReportAttachmentById', () => {
        it('should return row', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentById(1, 1);

          expect(response).to.eql({ id: 1 });
        });
      });

      describe('getSurveyReportAttachmentsByIds', () => {
        it('should return rows', async () => {
          const mockResponse = { rows: [{ id: 1 }, { id: 2 }], rowCount: 2 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentsByIds(1, [1, 2]);

          expect(response).to.eql([{ id: 1 }, { id: 2 }]);
        });
      });

      describe('getSurveyReportAttachmentAuthors', () => {
        it('should return rows', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentAuthors(1);

          expect(response).to.eql([{ id: 1 }]);
        });
      });

      describe('insertSurveyReportAttachment', () => {
        it('should return row', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertSurveyReportAttachment(
            'string',
            1,
            1,
            { title: 'string' } as unknown as PostReportAttachmentMetadata,
            'string'
          );

          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.insertSurveyReportAttachment(
              'string',
              1,
              1,
              { title: 'string' } as unknown as PostReportAttachmentMetadata,
              'string'
            );
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to insert survey report attachment');
          }
        });
      });

      describe('updateSurveyReportAttachment', () => {
        it('should return row', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateSurveyReportAttachment('string', 1, {
            title: 'string'
          } as unknown as PutReportAttachmentMetadata);

          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateSurveyReportAttachment('string', 1, {
              title: 'string'
            } as unknown as PutReportAttachmentMetadata);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update survey report attachment');
          }
        });
      });

      describe('getSurveyReportAttachmentByFileName', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentByFileName(1, 'string');

          expect(response).to.eql({ rows: [{ id: 1 }], rowCount: 1 });
        });
      });

      describe('deleteSurveyReportAttachmentAuthors', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteSurveyReportAttachmentAuthors(1);

          expect(response).to.eql(undefined);
        });
      });

      describe('insertSurveyReportAttachmentAuthor', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertSurveyReportAttachmentAuthor(1, {
            first_name: 'name',
            last_name: 'name'
          });

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.insertSurveyReportAttachmentAuthor(1, {
              first_name: 'name',
              last_name: 'name'
            });
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to insert survey report attachment');
          }
        });
      });

      describe('deleteSurveyReportAttachmentRecord', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteSurveyReportAttachmentRecord(1);

          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteSurveyReportAttachmentRecord(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete Survey Report Attachment');
          }
        });
      });

      describe('getSurveyReportAttachmentS3Key', () => {
        it('should return result', async () => {
          const mockResponse = { rows: [{ key: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentS3Key(1, 1);

          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportAttachmentS3Key(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get Survey Report Attachment S3 key');
          }
        });
      });

      describe('updateSurveyReportAttachmentMetadata', () => {
        it('should return row', async () => {
          const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateSurveyReportAttachmentMetadata(1, 1, {
            title: 'string'
          } as unknown as PutReportAttachmentMetadata);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateSurveyReportAttachmentMetadata(1, 1, {
              title: 'string'
            } as unknown as PutReportAttachmentMetadata);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update Survey Report Attachment metadata');
          }
        });
      });
    });
  });
});
