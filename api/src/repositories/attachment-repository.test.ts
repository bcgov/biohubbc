import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostReportAttachmentMetadata, PutReportAttachmentMetadata } from '../models/project-survey-attachments';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { getMockDBConnection } from '../__mocks__/db';

chai.use(sinonChai);

describe('AttachmentRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('Project', () => {
    describe('Attachment', () => {
      describe('getProjectAttachments', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectAttachments(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectAttachments(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get project attachments by projectId');
          }
        });
      });

      describe('getProjectAttachmentsWithSecurityCounts', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectAttachmentsWithSecurityCounts(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectAttachmentsWithSecurityCounts(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get project attachments with security rule count by projectId'
            );
          }
        });
      });

      describe('getProjectAttachmentById', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectAttachmentById(1, 1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectAttachmentById(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get project attachment by attachmentId');
          }
        });
      });

      describe('getProjectAttachmentSecurityReasons', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectAttachmentSecurityReasons(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectAttachmentSecurityReasons(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get project attachment security rules by attachmentId'
            );
          }
        });
      });

      describe('addSecurityRulesToProjectAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityRulesToProjectAttachment([1], 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityRulesToProjectAttachment([1], 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to attach security rules to project attachment');
          }
        });
      });

      describe('addSecurityReviewTimeToProjectAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityReviewTimeToProjectAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityReviewTimeToProjectAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to update the security review timestamp for project attachment'
            );
          }
        });
      });

      describe('removeSecurityRuleFromProjectAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeSecurityRuleFromProjectAttachment(1, 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeSecurityRuleFromProjectAttachment(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete project attachment security rule.');
          }
        });
      });

      describe('removeAllSecurityFromProjectAttachment', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeAllSecurityFromProjectAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeAllSecurityFromProjectAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete all project attachment security rules.');
          }
        });
      });

      describe('insertProjectAttachment', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertProjectAttachment(
            ({ file: 'name' } as unknown) as Express.Multer.File,
            1,
            'string',
            'string'
          );

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.insertProjectAttachment(
              ({ file: 'name' } as unknown) as Express.Multer.File,
              1,
              'string',
              'string'
            );
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to insert project attachment data');
          }
        });
      });

      describe('updateProjectAttachment', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateProjectAttachment('string', 1, 'string');

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateProjectAttachment('string', 1, 'string');
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update project attachment data');
          }
        });
      });

      describe('getProjectAttachmentByFileName', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectAttachmentByFileName(1, 'string');

          expect(response).to.not.be.null;
          expect(response).to.eql({ rows: [{ id: 1 }], rowCount: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectAttachmentByFileName(1, 'string');
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get project attachment by filename');
          }
        });
      });

      describe('getProjectAttachmentS3Key', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ key: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectAttachmentS3Key(1, 1);

          expect(response).to.not.be.null;
          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectAttachmentS3Key(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get Project Attachment S3 Key');
          }
        });
      });

      describe('deleteProjectAttachment', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteProjectAttachment(1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteProjectAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete Project Attachment by id');
          }
        });
      });
    });

    describe('Report Attachment', () => {
      describe('getProjectReportAttachments', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectReportAttachments(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectReportAttachments(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get project report attachments by projectId');
          }
        });
      });

      describe('getProjectReportAttachmentsWithSecurityCounts', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectReportAttachmentsWithSecurityCounts(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectReportAttachmentsWithSecurityCounts(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get project report attachments with security rule count by projectId'
            );
          }
        });
      });

      describe('getProjectReportAttachmentById', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectReportAttachmentById(1, 1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectReportAttachmentById(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get project report attachments by reportAttachmentId');
          }
        });
      });

      describe('getProjectReportAttachmentSecurityReasons', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectReportAttachmentSecurityReasons(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectReportAttachmentSecurityReasons(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get project report attachment security rules by reportAttachmentId'
            );
          }
        });
      });

      describe('addSecurityRulesToProjectReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityRulesToProjectReportAttachment([1], 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityRulesToProjectReportAttachment([1], 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to attach security rules to the given project report attachment'
            );
          }
        });
      });

      describe('addSecurityReviewTimeToProjectReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityReviewTimeToProjectReportAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityReviewTimeToProjectReportAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to update the security review timestamp for project report attachment'
            );
          }
        });
      });

      describe('removeSecurityRuleFromProjectReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeSecurityRuleFromProjectReportAttachment(1, 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeSecurityRuleFromProjectReportAttachment(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete project report attachment security rule.');
          }
        });
      });

      describe('removeAllSecurityFromProjectReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeAllSecurityFromProjectReportAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeAllSecurityFromProjectReportAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete all project report attachment security rules.');
          }
        });
      });

      describe('getProjectReportAttachmentAuthors', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectReportAttachmentAuthors(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectReportAttachmentAuthors(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get project report attachment authors by reportAttachmentId'
            );
          }
        });
      });

      describe('insertProjectReportAttachment', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertProjectReportAttachment(
            'string',
            1,
            1,
            ({ title: 'string' } as unknown) as PostReportAttachmentMetadata,
            'string'
          );

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.insertProjectReportAttachment(
              'string',
              1,
              1,
              ({ title: 'string' } as unknown) as PostReportAttachmentMetadata,
              'string'
            );
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to insert project report attachment data');
          }
        });
      });

      describe('updateProjectReportAttachment', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateProjectReportAttachment('string', 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateProjectReportAttachment('string', 1, ({
              title: 'string'
            } as unknown) as PutReportAttachmentMetadata);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update project attachment data');
          }
        });
      });

      describe('getProjectReportAttachmentByFileName', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectReportAttachmentByFileName(1, 'string');

          expect(response).to.not.be.null;
          expect(response).to.eql({ rows: [{ id: 1 }], rowCount: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectReportAttachmentByFileName(1, 'string');
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get Project Report Attachment by filename');
          }
        });
      });

      describe('deleteProjectReportAttachmentAuthors', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteProjectReportAttachmentAuthors(1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ rows: [{ id: 1 }], rowCount: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteProjectReportAttachmentAuthors(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete attachment report authors records');
          }
        });
      });

      describe('insertProjectReportAttachmentAuthor', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertProjectReportAttachmentAuthor(1, {
            first_name: 'name',
            last_name: 'name'
          });

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.insertProjectReportAttachmentAuthor(1, {
              first_name: 'name',
              last_name: 'name'
            });
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to insert attachment report author record');
          }
        });
      });

      describe('updateProjectReportAttachmentMetadata', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateProjectReportAttachmentMetadata(1, 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateProjectReportAttachmentMetadata(1, 1, ({
              title: 'string'
            } as unknown) as PutReportAttachmentMetadata);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update Project Report Attachment Metadata');
          }
        });
      });

      describe('getProjectReportAttachmentS3Key', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ key: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getProjectReportAttachmentS3Key(1, 1);

          expect(response).to.not.be.null;
          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getProjectReportAttachmentS3Key(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get Project Report Attachment S3 Key');
          }
        });
      });

      describe('deleteProjectReportAttachment', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteProjectReportAttachment(1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteProjectReportAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete Project Report Attachment by id');
          }
        });
      });
    });
  });

  describe('Survey', () => {
    describe('Attachment', () => {
      describe('getSurveyAttachments', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachments(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyAttachments(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get survey attachments by surveyId');
          }
        });
      });

      describe('getSurveyAttachmentsWithSecurityCounts', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentsWithSecurityCounts(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyAttachmentsWithSecurityCounts(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get survey attachments with security rule count by surveyId'
            );
          }
        });
      });

      describe('getSurveyAttachmentSecurityReasons', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentSecurityReasons(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyAttachmentSecurityReasons(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get survey attachment security rules by attachmentId');
          }
        });
      });

      describe('addSecurityRulesToSurveyAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityRulesToSurveyAttachment([1], 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityRulesToSurveyAttachment([1], 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to attach security rules to survey attachment');
          }
        });
      });

      describe('addSecurityReviewTimeToSurveyAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityReviewTimeToSurveyAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityReviewTimeToSurveyAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to update the security review timestamp for survey attachment'
            );
          }
        });
      });

      describe('removeSecurityRuleFromSurveyAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeSecurityRuleFromSurveyAttachment(1, 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeSecurityRuleFromSurveyAttachment(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete survey attachment security rule.');
          }
        });
      });

      describe('removeAllSecurityFromSurveyAttachment', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeAllSecurityFromSurveyAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeAllSecurityFromSurveyAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete all survey attachment security rules.');
          }
        });
      });

      describe('getSurveyAttachmentCountToReview', () => {
        it('should return count', async () => {
          const mockResponse = ({ rows: [{ count: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentCountToReview(1);

          expect(response).to.not.be.null;
          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyAttachmentCountToReview(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get count of survey attachments that need review');
          }
        });
      });

      describe('deleteSurveyAttachment', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteSurveyAttachment(1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteSurveyAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete Survey Attachment');
          }
        });
      });

      describe('getSurveyAttachmentS3Key', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ key: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentS3Key(1, 1);

          expect(response).to.not.be.null;
          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
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
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateSurveyAttachment(1, 'string', 'string');

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
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
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertSurveyAttachment('string', 1, 'string', 1, 'string');

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
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
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyAttachmentByFileName('string', 1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ rows: [{ id: 1 }], rowCount: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyAttachmentByFileName('string', 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get survey attachment by filename');
          }
        });
      });
    });

    describe('Report Attachment', () => {
      describe('getSurveyReportAttachments', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachments(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportAttachments(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get survey report attachments by surveyId');
          }
        });
      });

      describe('getSurveyReportAttachmentsWithSecurityCounts', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentsWithSecurityCounts(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportAttachmentsWithSecurityCounts(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get survey report attachments with security rule count by surveyId'
            );
          }
        });
      });

      describe('getSurveyReportAttachmentById', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentById(1, 1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportAttachmentById(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get survey report attachments by reportAttachmentId');
          }
        });
      });

      describe('getSurveyReportAttachmentSecurityReasons', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentSecurityReasons(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportAttachmentSecurityReasons(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get survey report attachment security rules by reportAttachmentId'
            );
          }
        });
      });

      describe('addSecurityRulesToSurveyReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityRulesToSurveyReportAttachment([1], 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ knex: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityRulesToSurveyReportAttachment([1], 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to attach security rules to the given survey report attachment'
            );
          }
        });
      });

      describe('addSecurityReviewTimeToSurveyReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.addSecurityReviewTimeToSurveyReportAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.addSecurityReviewTimeToSurveyReportAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to update the security review timestamp for survey report attachment'
            );
          }
        });
      });

      describe('removeSecurityRuleFromSurveyReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeSecurityRuleFromSurveyReportAttachment(1, 1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeSecurityRuleFromSurveyReportAttachment(1, 1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete survey report attachment security rule.');
          }
        });
      });

      describe('removeAllSecurityFromSurveyReportAttachment', () => {
        it('should return undefined', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.removeAllSecurityFromSurveyReportAttachment(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.removeAllSecurityFromSurveyReportAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete all survey report attachment security rules.');
          }
        });
      });

      describe('getSurveyReportAttachmentAuthors', () => {
        it('should return rows', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentAuthors(1);

          expect(response).to.not.be.null;
          expect(response).to.eql([{ id: 1 }]);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportAttachmentAuthors(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal(
              'Failed to get survey report attachment authors by reportAttachmentId'
            );
          }
        });
      });

      describe('getSurveyReportCountToReview', () => {
        it('should return count', async () => {
          const mockResponse = ({ rows: [{ count: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportCountToReview(1);

          expect(response).to.not.be.null;
          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportCountToReview(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get count of survey reports that need review');
          }
        });
      });

      describe('insertSurveyReportAttachment', () => {
        it('should return row', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertSurveyReportAttachment(
            'string',
            1,
            1,
            ({ title: 'string' } as unknown) as PostReportAttachmentMetadata,
            'string'
          );

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.insertSurveyReportAttachment(
              'string',
              1,
              1,
              ({ title: 'string' } as unknown) as PostReportAttachmentMetadata,
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
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateSurveyReportAttachment('string', 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = ({ rows: undefined } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateSurveyReportAttachment('string', 1, ({
              title: 'string'
            } as unknown) as PutReportAttachmentMetadata);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update survey report attachment');
          }
        });
      });

      describe('getSurveyReportAttachmentByFileName', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentByFileName(1, 'string');

          expect(response).to.not.be.null;
          expect(response).to.eql({ rows: [{ id: 1 }], rowCount: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.getSurveyReportAttachmentByFileName(1, 'string');
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to get Survey Report Attachment by filename');
          }
        });
      });

      describe('deleteSurveyReportAttachmentAuthors', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteSurveyReportAttachmentAuthors(1);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteSurveyReportAttachmentAuthors(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete survey report attachment');
          }
        });
      });

      describe('insertSurveyReportAttachmentAuthor', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.insertSurveyReportAttachmentAuthor(1, {
            first_name: 'name',
            last_name: 'name'
          });

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
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

      describe('deleteSurveyReportAttachment', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.deleteSurveyReportAttachment(1);

          expect(response).to.not.be.null;
          expect(response).to.eql({ id: 1 });
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.deleteSurveyReportAttachment(1);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to delete Survey Report Attachment');
          }
        });
      });

      describe('getSurveyReportAttachmentS3Key', () => {
        it('should return result', async () => {
          const mockResponse = ({ rows: [{ key: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.getSurveyReportAttachmentS3Key(1, 1);

          expect(response).to.not.be.null;
          expect(response).to.eql(1);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
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
          const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          const response = await repository.updateSurveyReportAttachmentMetadata(1, 1, ({
            title: 'string'
          } as unknown) as PutReportAttachmentMetadata);

          expect(response).to.eql(undefined);
        });

        it('should throw an error', async () => {
          const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
          const dbConnection = getMockDBConnection({ sql: () => mockResponse });

          const repository = new AttachmentRepository(dbConnection);

          try {
            await repository.updateSurveyReportAttachmentMetadata(1, 1, ({
              title: 'string'
            } as unknown) as PutReportAttachmentMetadata);
            expect.fail();
          } catch (error) {
            expect((error as Error).message).to.equal('Failed to update Survey Report Attachment metadata');
          }
        });
      });
    });
  });
});
