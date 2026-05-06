import { expect } from 'chai';
import sinon from 'sinon';
import { getMockDBConnection } from '../__mocks__/db';
import * as S3 from '../utils/file-utils';
import { CritterAttachmentService } from './critter-attachment-service';

describe('CritterCaptureAttachmentService', () => {
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

  describe('transformCaptureAttachmentsForResponse', () => {
    it('should transform photo attachments correctly', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon.stub(S3, 'getS3SignedURL').resolves('https://s3.example.com/signed-url');

      const attachments = [
        {
          critter_capture_attachment_id: 1,
          uuid: '111-111-111',
          critter_id: 3,
          critterbase_capture_id: '222-222-222',
          file_type: 'Other',
          file_name: 'moose_picture.jpg',
          file_size: 100,
          title: 'Moose 1',
          description: 'Picture of a moose',
          key: 'project/1/survey/1/critter/3/attachment/1'
        }
      ];

      const result = await service.transformCaptureAttachmentsForResponse(attachments);

      expect(mockGetS3SignedURL).to.have.been.calledOnceWithExactly('project/1/survey/1/critter/3/attachment/1');
      expect(result).to.deep.equal([
        {
          attachment_id: 1,
          attachment_type: 'photo',
          attachment_url: 'https://s3.example.com/signed-url',
          critterbase_capture_id: '222-222-222',
          critter_capture_attachment_id: 1,
          file_name: 'moose_picture.jpg',
          file_size: 100,
          file_type: 'Other',
          key: 'project/1/survey/1/critter/3/attachment/1'
        }
      ]);
    });

    it('should transform video attachments correctly', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon.stub(S3, 'getS3SignedURL').resolves('https://s3.example.com/video-url');

      const attachments = [
        {
          critter_capture_attachment_id: 2,
          uuid: '222-222-222',
          critter_id: 3,
          critterbase_capture_id: '333-333-333',
          file_type: 'Other',
          file_name: 'moose_video.mp4',
          file_size: 5000,
          title: 'Moose Video',
          description: 'Video of a moose',
          key: 'project/1/survey/1/critter/3/attachment/2'
        }
      ];

      const result = await service.transformCaptureAttachmentsForResponse(attachments);

      expect(mockGetS3SignedURL).to.have.been.calledOnceWithExactly('project/1/survey/1/critter/3/attachment/2');
      expect(result).to.deep.equal([
        {
          attachment_id: 2,
          attachment_type: 'video',
          attachment_url: 'https://s3.example.com/video-url',
          critterbase_capture_id: '333-333-333',
          critter_capture_attachment_id: 2,
          file_name: 'moose_video.mp4',
          file_size: 5000,
          file_type: 'Other',
          key: 'project/1/survey/1/critter/3/attachment/2'
        }
      ]);
    });

    it('should handle null file names and default to photo', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon.stub(S3, 'getS3SignedURL').resolves('https://s3.example.com/signed-url');

      const attachments = [
        {
          critter_capture_attachment_id: 3,
          uuid: '333-333-333',
          critter_id: 3,
          critterbase_capture_id: '444-444-444',
          file_type: 'Other',
          file_name: null,
          file_size: 200,
          title: null,
          description: null,
          key: 'project/1/survey/1/critter/3/attachment/3'
        }
      ];

      const result = await service.transformCaptureAttachmentsForResponse(attachments);

      expect(mockGetS3SignedURL).to.have.been.calledOnceWithExactly('project/1/survey/1/critter/3/attachment/3');
      expect(result[0].attachment_type).to.equal('photo');
      expect(result[0].file_name).to.be.null;
    });

    it('should handle files without extensions and default to photo', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon.stub(S3, 'getS3SignedURL').resolves('https://s3.example.com/signed-url');

      const attachments = [
        {
          critter_capture_attachment_id: 4,
          uuid: '444-444-444',
          critter_id: 3,
          critterbase_capture_id: '555-555-555',
          file_type: 'Other',
          file_name: 'noextension',
          file_size: 300,
          title: null,
          description: null,
          key: 'project/1/survey/1/critter/3/attachment/4'
        }
      ];

      const result = await service.transformCaptureAttachmentsForResponse(attachments);

      expect(mockGetS3SignedURL).to.have.been.calledOnceWithExactly('project/1/survey/1/critter/3/attachment/4');
      expect(result[0].attachment_type).to.equal('photo');
    });

    it('should handle files with dot but no extension and default to photo', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon.stub(S3, 'getS3SignedURL').resolves('https://s3.example.com/signed-url');

      const attachments = [
        {
          critter_capture_attachment_id: 5,
          uuid: '555-555-555',
          critter_id: 3,
          critterbase_capture_id: '666-666-666',
          file_type: 'Other',
          file_name: 'file.',
          file_size: 400,
          title: null,
          description: null,
          key: 'project/1/survey/1/critter/3/attachment/5'
        }
      ];

      const result = await service.transformCaptureAttachmentsForResponse(attachments);

      expect(mockGetS3SignedURL).to.have.been.calledOnceWithExactly('project/1/survey/1/critter/3/attachment/5');
      expect(result[0].attachment_type).to.equal('photo');
    });

    it('should handle null S3 signed URLs', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon.stub(S3, 'getS3SignedURL').resolves(null);

      const attachments = [
        {
          critter_capture_attachment_id: 6,
          uuid: '666-666-666',
          critter_id: 3,
          critterbase_capture_id: '777-777-777',
          file_type: 'Other',
          file_name: 'test.jpg',
          file_size: 500,
          title: null,
          description: null,
          key: 'project/1/survey/1/critter/3/attachment/6'
        }
      ];

      const result = await service.transformCaptureAttachmentsForResponse(attachments);

      expect(mockGetS3SignedURL).to.have.been.calledOnceWithExactly('project/1/survey/1/critter/3/attachment/6');
      expect(result[0].attachment_url).to.equal('');
    });

    it('should handle empty attachments array', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const result = await service.transformCaptureAttachmentsForResponse([]);

      expect(result).to.deep.equal([]);
    });

    it('should handle multiple attachments with different types', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon
        .stub(S3, 'getS3SignedURL')
        .onFirstCall()
        .resolves('https://s3.example.com/photo-url')
        .onSecondCall()
        .resolves('https://s3.example.com/video-url');

      const attachments = [
        {
          critter_capture_attachment_id: 7,
          uuid: '777-777-777',
          critter_id: 3,
          critterbase_capture_id: '888-888-888',
          file_type: 'Other',
          file_name: 'photo.jpg',
          file_size: 100,
          title: null,
          description: null,
          key: 'project/1/survey/1/critter/3/attachment/7'
        },
        {
          critter_capture_attachment_id: 8,
          uuid: '888-888-888',
          critter_id: 3,
          critterbase_capture_id: '999-999-999',
          file_type: 'Other',
          file_name: 'video.mov',
          file_size: 2000,
          title: null,
          description: null,
          key: 'project/1/survey/1/critter/3/attachment/8'
        }
      ];

      const result = await service.transformCaptureAttachmentsForResponse(attachments);

      expect(result).to.have.length(2);
      expect(result[0].attachment_type).to.equal('photo');
      expect(result[1].attachment_type).to.equal('video');
      expect(mockGetS3SignedURL).to.have.been.calledTwice;
    });

    it('should handle different video extensions', async () => {
      const connection = getMockDBConnection();
      const service = new CritterAttachmentService(connection);

      const mockGetS3SignedURL = sinon.stub(S3, 'getS3SignedURL').resolves('https://s3.example.com/signed-url');

      const videoExtensions = ['test.mp4', 'test.mov', 'test.wmv', 'test.ave'];

      for (const fileName of videoExtensions) {
        const key = `project/1/survey/1/critter/3/attachment/${fileName}`;
        const attachments = [
          {
            critter_capture_attachment_id: 9,
            uuid: '999-999-999',
            critter_id: 3,
            critterbase_capture_id: 'aaa-aaa-aaa',
            file_type: 'Other',
            file_name: fileName,
            file_size: 1000,
            title: null,
            description: null,
            key: key
          }
        ];

        const result = await service.transformCaptureAttachmentsForResponse(attachments);

        expect(mockGetS3SignedURL).to.have.been.calledWith(key);
        expect(result[0].attachment_type).to.equal('video', `Failed for ${fileName}`);
      }

      expect(mockGetS3SignedURL).to.have.been.callCount(videoExtensions.length);
    });
  });
});
