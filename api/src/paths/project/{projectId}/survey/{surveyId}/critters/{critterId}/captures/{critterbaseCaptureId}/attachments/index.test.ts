import { expect } from 'chai';
import sinon from 'sinon';
import { deleteCritterCaptureAttachments } from '.';
import * as db from '../../../../../../../../../../database/db';
import { CritterAttachmentService } from '../../../../../../../../../../services/critter-attachment-service';
import * as S3 from '../../../../../../../../../../utils/file-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../../../__mocks__/db';

describe('deleteCritterCaptureAttachments', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('deletes all attachments for a critter capture', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });

    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockFindAttachments = sinon.stub(CritterAttachmentService.prototype, 'findAllCritterCaptureAttachments');
    const mockDeleteAttachments = sinon.stub(CritterAttachmentService.prototype, 'deleteCritterCaptureAttachments');
    const mockDeleteFileFromS3 = sinon.stub(S3, 'deleteFileFromS3').resolves({} as any);

    mockFindAttachments.resolves([{ critter_capture_attachment_id: 1, key: 'DELETE_S3_KEY' }] as any[]);
    mockDeleteAttachments.resolves(['DELETE_S3_KEY']);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3',
      critterbaseCaptureId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const requestHandler = deleteCritterCaptureAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(mockFindAttachments).to.have.been.calledOnceWithExactly(2, '123e4567-e89b-12d3-a456-426614174000');
    expect(mockDeleteAttachments).to.have.been.calledOnceWithExactly(2, [1]);

    expect(mockDeleteFileFromS3).to.have.been.calledOnceWithExactly('DELETE_S3_KEY');

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.send).to.have.been.calledWith();

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
    expect(mockDBConnection.rollback).to.not.have.been.called;
  });

  it('deletes multiple attachments for a critter capture', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });

    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockFindAttachments = sinon.stub(CritterAttachmentService.prototype, 'findAllCritterCaptureAttachments');
    const mockDeleteAttachments = sinon.stub(CritterAttachmentService.prototype, 'deleteCritterCaptureAttachments');
    const mockDeleteFileFromS3 = sinon.stub(S3, 'deleteFileFromS3').resolves({} as any);

    mockFindAttachments.resolves([
      { critter_capture_attachment_id: 1, key: 'DELETE_S3_KEY_1' },
      { critter_capture_attachment_id: 2, key: 'DELETE_S3_KEY_2' }
    ] as any[]);
    mockDeleteAttachments.resolves(['DELETE_S3_KEY_1', 'DELETE_S3_KEY_2']);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3',
      critterbaseCaptureId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const requestHandler = deleteCritterCaptureAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockFindAttachments).to.have.been.calledOnceWithExactly(2, '123e4567-e89b-12d3-a456-426614174000');
    expect(mockDeleteAttachments).to.have.been.calledOnceWithExactly(2, [1, 2]);
    expect(mockDeleteFileFromS3).to.have.been.calledTwice;
    expect(mockDeleteFileFromS3).to.have.been.calledWith('DELETE_S3_KEY_1');
    expect(mockDeleteFileFromS3).to.have.been.calledWith('DELETE_S3_KEY_2');
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.send).to.have.been.calledWith();
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('handles empty attachments array', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });

    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockFindAttachments = sinon.stub(CritterAttachmentService.prototype, 'findAllCritterCaptureAttachments');
    const mockDeleteAttachments = sinon.stub(CritterAttachmentService.prototype, 'deleteCritterCaptureAttachments');
    const mockDeleteFileFromS3 = sinon.stub(S3, 'deleteFileFromS3');

    mockFindAttachments.resolves([]);
    mockDeleteAttachments.resolves([]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3',
      critterbaseCaptureId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const requestHandler = deleteCritterCaptureAttachments();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getDBConnectionStub).to.have.been.calledOnce;
    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockFindAttachments).to.have.been.calledOnceWithExactly(2, '123e4567-e89b-12d3-a456-426614174000');
    expect(mockDeleteAttachments).to.have.been.calledOnceWithExactly(2, []);
    expect(mockDeleteFileFromS3).to.not.have.been.called;
    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.send).to.have.been.calledWith();
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });

    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockError = new Error('test error');
    const mockFindAttachments = sinon
      .stub(CritterAttachmentService.prototype, 'findAllCritterCaptureAttachments')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3',
      critterbaseCaptureId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const requestHandler = deleteCritterCaptureAttachments();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (err: any) {
      expect(err.message).to.equal('test error');
      expect(getDBConnectionStub).to.have.been.calledOnce;
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockFindAttachments).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.not.have.been.called;
    }
  });
});
