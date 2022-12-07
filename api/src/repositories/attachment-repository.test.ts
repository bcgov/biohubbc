import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { getMockDBConnection } from '../__mocks__/db';

chai.use(sinonChai);

describe('AttachmentRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getProjectAttachments', () => {
    it('should return rows', async () => {
      const mockResponse = ({ rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
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

  describe('getProjectReportAttachments', () => {
    it('should return rows', async () => {
      const mockResponse = ({ rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
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

    describe('getProjectAttachmentsWithSecurityCounts', () => {
      it('should return rows', async () => {
        const mockResponse = ({ rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
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

    describe('getProjectReportAttachmentsWithSecurityCounts', () => {
      it('should return rows', async () => {
        const mockResponse = ({ rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
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
  });
});
