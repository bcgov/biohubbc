import { S3 } from 'aws-sdk';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { AttachmentService } from '../../../../../services/attachment-service';
import * as file_utils from '../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as deleteAttachment from './delete';

chai.use(sinonChai);

describe('deleteAttachment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'removeAllSecurityFromProjectReportAttachment').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report' },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    try {
      const result = deleteAttachment.deleteAttachment();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should delete Project `Report` Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report' },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const removeAllSecurityFromProjectReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeAllSecurityFromProjectReportAttachment')
      .resolves();

    const deleteProjectReportAttachmentAuthorsStub = sinon
      .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
      .resolves();

    const deleteProjectReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'deleteProjectReportAttachment')
      .resolves({ key: 'string' });

    const fileUtilsStub = sinon
      .stub(file_utils, 'deleteFileFromS3')
      .resolves((true as unknown) as S3.DeleteObjectOutput);

    let actualResult: any = null;
    const sampleRes = {
      status: () => {
        return {
          send: (response: any) => {
            actualResult = response;
          }
        };
      }
    };

    const result = deleteAttachment.deleteAttachment();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeAllSecurityFromProjectReportAttachmentStub).to.be.calledOnce;
    expect(deleteProjectReportAttachmentAuthorsStub).to.be.calledOnce;
    expect(deleteProjectReportAttachmentStub).to.be.calledOnce;
    expect(fileUtilsStub).to.be.calledOnce;
  });

  it('should delete Project Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Attachment' },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const removeAllSecurityFromProjectAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeAllSecurityFromProjectAttachment')
      .resolves();

    const deleteProjectAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'deleteProjectAttachment')
      .resolves({ key: 'string' });

    const fileUtilsStub = sinon.stub(file_utils, 'deleteFileFromS3').resolves();

    let actualResult: any = null;
    const sampleRes = {
      status: () => {
        return {
          json: (response: any) => {
            actualResult = response;
          }
        };
      }
    };

    const result = deleteAttachment.deleteAttachment();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(null);
    expect(removeAllSecurityFromProjectAttachmentStub).to.be.calledOnce;
    expect(deleteProjectAttachmentStub).to.be.calledOnce;
    expect(fileUtilsStub).to.be.calledOnce;
  });
});
