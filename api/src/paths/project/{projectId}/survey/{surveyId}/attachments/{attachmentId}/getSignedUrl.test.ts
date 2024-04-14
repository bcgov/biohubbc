import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import * as file_utils from '../../../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as get_signed_url from './getSignedUrl';

chai.use(sinonChai);

describe('getSurveyAttachmentSignedURL', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('report attachments', () => {
    it('should throw an error when a failure occurs', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const expectedError = new Error('cannot process request');
      sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachmentS3Key').rejects(expectedError);

      const sampleReq = {
        keycloak_token: {},
        body: { attachments: [], security_ids: [] },
        params: {
          projectId: 1,
          attachmentId: 1
        },
        query: {
          attachmentType: 'Report'
        }
      } as any;

      try {
        const result = get_signed_url.getSurveyAttachmentSignedURL();

        await result(sampleReq, null as unknown as any, null as unknown as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });

    it('should return the signed url response on success', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const getSurveyReportAttachmentS3KeyStub = sinon
        .stub(AttachmentService.prototype, 'getSurveyReportAttachmentS3Key')
        .resolves('key');

      const sampleReq = {
        keycloak_token: {},
        body: { attachments: [], security_ids: [] },
        params: {
          projectId: 1,
          attachmentId: 1
        },
        query: {
          attachmentType: 'Report'
        }
      } as any;

      const getS3SignedURLStub = sinon.stub(file_utils, 'getS3SignedURL').resolves('myurlsigned.com');

      let actualResult: any = null;

      const sampleRes = {
        status: () => {
          return {
            json: (result: any) => {
              actualResult = result;
            }
          };
        }
      };

      const result = get_signed_url.getSurveyAttachmentSignedURL();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.eql('myurlsigned.com');
      expect(getSurveyReportAttachmentS3KeyStub).to.be.calledOnce;
      expect(getS3SignedURLStub).to.be.calledOnce;
    });
  });

  describe('non report attachments', () => {
    it('should return the signed url response on success', async () => {
      const dbConnectionObj = getMockDBConnection();
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const getSurveyAttachmentS3KeyStub = sinon
        .stub(AttachmentService.prototype, 'getSurveyAttachmentS3Key')
        .resolves('key');

      const sampleReq = {
        keycloak_token: {},
        body: { attachments: [], security_ids: [] },
        params: {
          projectId: 1,
          attachmentId: 1
        },
        query: {
          attachmentType: 'Other'
        }
      } as any;

      const getS3SignedURLStub = sinon.stub(file_utils, 'getS3SignedURL').resolves();

      let actualResult: any = null;

      const sampleRes = {
        status: () => {
          return {
            json: (result: any) => {
              actualResult = result;
            }
          };
        }
      };

      const result = get_signed_url.getSurveyAttachmentSignedURL();

      await result(sampleReq, sampleRes as any, null as unknown as any);

      expect(actualResult).to.eql(null);
      expect(getSurveyAttachmentS3KeyStub).to.be.calledOnce;
      expect(getS3SignedURLStub).to.be.calledOnce;
    });
  });
});
