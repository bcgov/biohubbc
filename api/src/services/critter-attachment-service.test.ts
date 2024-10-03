import { expect } from 'chai';
import sinon from 'sinon';
import { getMockDBConnection } from '../__mocks__/db';
import { CritterAttachmentService } from './critter-attachment-service';

describe.only('CritterCaptureAttachmentService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCritterCaptureAttachmentS3Key', () => {
    it('should call the repository method with correct params', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockRepoMethod = sinon
        .stub(service.attachmentRepository, 'getCritterCaptureAttachmentS3Key')
        .resolves('key');

      const result = await service.getCritterCaptureAttachmentS3Key(1, 2);

      expect(mockRepoMethod.calledOnceWithExactly(1, 2)).to.be.true;
      expect(result).to.equal('key');
    });
  });

  describe('upsertCritterCaptureAttachment', () => {
    it('should call the repository method with correct params', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockRepoMethod = sinon
        .stub(service.attachmentRepository, 'upsertCritterCaptureAttachment')
        .resolves({ critter_capture_attachment_id: 1, key: 'KEY' })
        .resolves({ critter_capture_attachment_id: 1, key: 'KEY' });

      const result = await service.upsertCritterCaptureAttachment({
        critter_id: 1,
        critterbase_capture_id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'test.txt',
        file_size: 1024,
        key: 'KEY'
      });

      expect(mockRepoMethod).to.have.been.calledOnceWithExactly({
        critter_id: 1,
        critterbase_capture_id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'test.txt',
        file_size: 1024,
        key: 'KEY'
      });

      expect(result).to.deep.equal({ critter_capture_attachment_id: 1, key: 'KEY' });
    });
  });

  describe('deleteCritterCaptureAttachments', () => {
    it('should call the repository method with correct params', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockRepoMethod = sinon
        .stub(service.attachmentRepository, 'deleteCritterCaptureAttachments')
        .resolves(['key']);

      const result = await service.deleteCritterCaptureAttachments(1, [1, 2]);

      expect(mockRepoMethod).to.have.been.calledOnceWithExactly(1, [1, 2]);
      expect(result).to.deep.equal(['key']);
    });
  });

  describe('findAllCritterCaptureAttachments', () => {
    it('should call the repository method with correct params', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockRepoMethod = sinon
        .stub(service.attachmentRepository, 'findAllCritterCaptureAttachments')
        .resolves([{ critter_capture_attachment_id: 1, key: 'key' }] as any[]);

      const result = await service.findAllCritterCaptureAttachments(1, '123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepoMethod).to.have.been.calledOnceWithExactly(1, '123e4567-e89b-12d3-a456-426614174000');
      expect(result).to.deep.equal([{ critter_capture_attachment_id: 1, key: 'key' }]);
    });
  });

  describe('findAllCritterAttachments', () => {
    it('should call the repository method with correct params', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockRepoMethod = sinon
        .stub(service.attachmentRepository, 'findCaptureAttachmentsByCritterId')
        .resolves([{ critter_attachment_id: 1, key: 'key' }] as any[]);

      const result = await service.findAllCritterAttachments(1);

      expect(mockRepoMethod).to.have.been.calledOnceWithExactly(1);
      expect(result).to.deep.equal({ captureAttachments: [{ critter_attachment_id: 1, key: 'key' }] });
    });
  });
});
