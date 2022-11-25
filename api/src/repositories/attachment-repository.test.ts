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
    it('should return a submission', async () => {
      const mockResponse = ({ rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new AttachmentRepository(dbConnection);
      const response = await repo.getProjectAttachments(1);

      expect(response).to.not.be.null;
      expect(response).to.eql([{ id: 1 }]);
    });

    it('should throw an error', async () => {
      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new AttachmentRepository(dbConnection);

      try {
        await repo.getProjectAttachments(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project attachments by projectId');
      }
    });
  });

  describe('getProjectReportAttachments', () => {
    it('should return a submission', async () => {
      const mockResponse = ({ rows: [{ id: 1 }] } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new AttachmentRepository(dbConnection);
      const response = await repo.getProjectReportAttachments(1);

      expect(response).to.not.be.null;
      expect(response).to.eql([{ id: 1 }]);
    });

    it('should throw an error', async () => {
      const mockResponse = ({} as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        sql: async () => {
          return mockResponse;
        }
      });
      const repo = new AttachmentRepository(dbConnection);

      try {
        await repo.getProjectReportAttachments(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project report attachments by projectId');
      }
    });
  });
});
