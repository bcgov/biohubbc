import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../services/attachment-service';
import * as file_utils from '../../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import * as upload from './upload';

chai.use(sinonChai);

describe('uploadMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      attachmentId: 2
    },
    files: [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ],
    body: {}
  } as any;

  it('should throw an error if failure occurs', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'upsertSurveyAttachment').rejects(expectedError);

    try {
      const result = upload.uploadMedia();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid params', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'uploadFileToS3').resolves();

    const expectedResponse = { attachmentId: 1, revision_count: 1 };

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

    const upsertSurveyAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyAttachment')
      .resolves({ survey_attachment_id: 1, revision_count: 1, key: 'string' });

    const result = upload.uploadMedia();

    await result(mockReq, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(upsertSurveyAttachmentStub).to.be.calledOnce;
  });
});
