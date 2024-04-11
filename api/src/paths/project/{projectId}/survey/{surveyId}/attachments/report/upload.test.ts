import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import * as file_utils from '../../../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as upload from './upload';

chai.use(sinonChai);

describe('uploadMedia', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when files are missing', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockReq = {
      keycloak_token: {},
      params: {
        projectId: 1,
        attachmentId: 2
      },
      files: [],
      body: {
        attachmentType: 'Other'
      }
    } as any;

    try {
      const result = upload.uploadMedia();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing upload data');
    }
  });

  it('should throw an error when file format incorrect', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

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
      body: {
        attachmentType: 'Other'
      }
    } as any;

    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    try {
      const result = upload.uploadMedia();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should throw an error if failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

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
      body: {
        attachmentType: 'Other'
      }
    } as any;

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'upsertSurveyReportAttachment').rejects(expectedError);

    try {
      const result = upload.uploadMedia();

      await result(mockReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid params', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(file_utils, 'uploadFileToS3').resolves();

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
      body: {
        attachmentType: 'Other'
      }
    } as any;

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

    const upsertSurveyReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'upsertSurveyReportAttachment')
      .resolves({ survey_report_attachment_id: 1, revision_count: 1, key: 'string' });

    const result = upload.uploadMedia();

    await result(mockReq, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(upsertSurveyReportAttachmentStub).to.be.calledOnce;
  });
});
