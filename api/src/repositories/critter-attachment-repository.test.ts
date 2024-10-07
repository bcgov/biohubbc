import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { CritterAttachmentRepository } from './critter-attachment-repository';

chai.use(sinonChai);

describe.only('CritterAttachmentRepository', () => {
  describe('getCritterCaptureAttachmentS3Key', () => {
    it('gets S3 key', async () => {
      const mockResponse = { rows: [{ key: 'key' }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);

      const result = await service.getCritterCaptureAttachmentS3Key(1, 1);

      expect(mockConnection.sql).to.have.been.calledOnce;
      expect(result).to.be.equal('key');
    });

    it('throws error when no rows are returned', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);

      try {
        await service.getCritterCaptureAttachmentS3Key(1, 1);
      } catch (error: any) {
        expect(error.message).to.be.equal('Failed to get critter capture attachment signed URL');
      }
    });
  });

  describe('upsertCritterCaptureAttachment', () => {
    it('upserts attachment', async () => {
      const mockResponse = { rows: [{ critter_capture_attachment_id: 1, key: 'key' }], rowCount: 1 } as any as Promise<
        QueryResult<any>
      >;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);

      const result = await service.upsertCritterCaptureAttachment({} as any);

      expect(mockConnection.sql).to.have.been.calledOnce;
      expect(result).to.be.deep.equal({ critter_capture_attachment_id: 1, key: 'key' });
    });

    it('throws error when no rows are returned', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);

      try {
        await service.upsertCritterCaptureAttachment({} as any);
      } catch (error: any) {
        expect(error.message).to.be.equal('Failed to upsert critter capture attachment data');
      }
    });
  });

  describe('upsertCritterMortalityAttachment', () => {
    it('upserts attachment', async () => {
      const mockResponse = {
        rows: [{ critter_mortality_attachment_id: 1, key: 'key' }],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);

      const result = await service.upsertCritterMortalityAttachment({} as any);

      expect(mockConnection.sql).to.have.been.calledOnce;
      expect(result).to.be.deep.equal({ critter_mortality_attachment_id: 1, key: 'key' });
    });

    it('throws error when no rows are returned', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);

      try {
        await service.upsertCritterMortalityAttachment({} as any);
      } catch (error: any) {
        expect(error.message).to.be.equal('Failed to upsert critter mortality attachment data');
      }
    });
  });

  describe('findAllCritterCaptureAttachments', () => {
    it('finds all attachments', async () => {
      const mockResponse = { rows: [{ key: 'key' }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);
      const result = await service.findAllCritterCaptureAttachments(1, 'uuid');

      expect(mockConnection.sql).to.have.been.calledOnce;
      expect(result).to.deep.equal([{ key: 'key' }]);
    });
  });

  describe('findCaptureAttachmentsByCritterId', () => {
    it('finds all attachments by critter ID', async () => {
      const mockResponse = { rows: [{ key: 'key' }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);
      const result = await service.findCaptureAttachmentsByCritterId(1);

      expect(mockConnection.sql).to.have.been.calledOnce;
      expect(result).to.deep.equal([{ key: 'key' }]);
    });
  });

  describe('deleteCritterCaptureAttachments', () => {
    it('deletes attachment', async () => {
      const mockResponse = { rows: [{ key: 1 }, { key: 2 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const mockConnection = getMockDBConnection({ knex: sinon.stub().resolves(mockResponse) });

      const service = new CritterAttachmentRepository(mockConnection);

      const result = await service.deleteCritterCaptureAttachments(1, [1, 2]);

      expect(mockConnection.knex).to.have.been.calledOnce;
      expect(result).to.deep.equal([1, 2]);
    });
  });
});
