import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import * as file_utils from '../../../../../../../utils/file-utils';
import * as media_utils from '../../../../../../../utils/media/media-utils';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as upload from './upload';
import { BctwKeyxService } from '../../../../../../../services/bctw-service/bctw-keyx-service';

chai.use(sinonChai);

describe('uploadMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    system_user: { user_guid: 'system_user_guid', user_identifier: 'system_user_identifier' },
    params: {
      projectId: 1,
      attachmentId: 2
    },
    files: [
      {
        fieldname: 'media',
        originalname: 'test.keyx',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ],
    body: {}
  } as any;

  const mockBctwResponse = { totalKeyxFiles: 2, newRecords: 1, existingRecords: 1 };

  it('should throw an error when file has malicious content', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    try {
      const result = upload.uploadKeyxMedia();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should throw an error when file type is invalid', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(media_utils, 'checkFileForKeyx').returns(false);

    try {
      const result = upload.uploadKeyxMedia();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'The file must either be a keyx file or a zip containing only keyx files.'
      );
    }
  });

  it('should throw an error if failure occurs', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);

    const expectedError = new Error('A test error');
    sinon.stub(BctwKeyxService.prototype, 'uploadKeyX').rejects(expectedError);

    try {
      const result = upload.uploadKeyxMedia();

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

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    const uploadKeyXStub = sinon.stub(BctwKeyxService.prototype, 'uploadKeyX').resolves(mockBctwResponse);
    sinon.stub(file_utils, 'uploadFileToS3').resolves();

    const expectedResponse = { attachmentId: 1, revision_count: 1, keyxResults: mockBctwResponse };

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

    const result = upload.uploadKeyxMedia();

    await result(mockReq, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(uploadKeyXStub).to.be.calledOnce;
    expect(upsertSurveyAttachmentStub).to.be.calledOnce;
  });
});
