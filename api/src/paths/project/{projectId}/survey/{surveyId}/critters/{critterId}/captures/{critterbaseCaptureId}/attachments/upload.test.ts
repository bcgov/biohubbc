import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../../../../../database/db';
import { CritterAttachmentService } from '../../../../../../../../../../services/critter-attachment-service';
import * as S3 from '../../../../../../../../../../utils/file-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../../../__mocks__/db';
import { uploadCaptureAttachments } from './upload';

describe('uploadCaptureAttachments', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockFile = {
    fieldname: 'media',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 1024,
    buffer: Buffer.from('test')
  };

  it('creates attachments and deletes any attachments from a list of ids', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });

    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockUpsertAttachment = sinon.stub(CritterAttachmentService.prototype, 'upsertCritterCaptureAttachment');
    const mockDeleteAttachments = sinon.stub(CritterAttachmentService.prototype, 'deleteCritterCaptureAttachments');
    const mockS3UploadFileToS3 = sinon.stub(S3, 'uploadFileToS3');
    const mockS3GenerateS3FileKey = sinon.stub(S3, 'generateS3FileKey').returns('S3KEY');
    const mockBulkDeleteFilesFromS3 = sinon.stub(S3, 'bulkDeleteFilesFromS3');

    mockUpsertAttachment.resolves({ critter_capture_attachment_id: 1, key: 'S3KEY' });
    mockDeleteAttachments.resolves(['DELETE_S3_KEY']);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.files = [mockFile as Express.Multer.File];
    mockReq.body = {
      delete_ids: ['1', '2']
    };
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3',
      critterbaseCaptureId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const requestHandler = uploadCaptureAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(mockDeleteAttachments).to.have.been.calledOnceWithExactly(2, [1, 2]);
    expect(mockBulkDeleteFilesFromS3).to.have.been.calledOnceWithExactly(['DELETE_S3_KEY']);

    expect(mockS3GenerateS3FileKey).to.have.been.calledOnceWithExactly({
      projectId: 1,
      surveyId: 2,
      critterId: 3,
      folder: 'captures',
      critterbaseCaptureId: '123e4567-e89b-12d3-a456-426614174000',
      fileName: 'test.txt'
    });

    expect(mockUpsertAttachment).to.have.been.calledOnceWithExactly({
      critter_id: 3,
      critterbase_capture_id: '123e4567-e89b-12d3-a456-426614174000',
      file_name: 'test.txt',
      file_size: 1024,
      key: 'S3KEY'
    });

    expect(mockS3UploadFileToS3).to.have.been.calledWith(mockFile, 'S3KEY');

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith({ attachment_ids: [1] });

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
    expect(mockDBConnection.rollback).to.not.have.been.called;
  });
});
