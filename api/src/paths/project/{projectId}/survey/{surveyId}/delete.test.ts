import { S3 } from 'aws-sdk';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { ISurveyAttachment } from '../../../../../repositories/attachment-repository';
import { AttachmentService } from '../../../../../services/attachment-service';
import { SurveyService } from '../../../../../services/survey-service';
import * as file_utils from '../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as del from './delete';

chai.use(sinonChai);

describe('deleteSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'getSurveyAttachments').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    try {
      const result = del.deleteSurvey();

      await result(sampleReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should delete Survey if no S3 files deleted return', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    const getSurveyAttachmentsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyAttachments')
      .resolves([{ key: 'key' } as unknown as ISurveyAttachment]);

    const deleteSurveyStub = sinon.stub(SurveyService.prototype, 'deleteSurvey').resolves();

    const fileUtilsStub = sinon
      .stub(file_utils, 'deleteFileFromS3')
      .resolves(false as unknown as S3.DeleteObjectOutput);

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

    const result = del.deleteSurvey();

    await result(sampleReq, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(null);
    expect(getSurveyAttachmentsStub).to.be.calledOnce;
    expect(deleteSurveyStub).to.be.calledOnce;
    expect(fileUtilsStub).to.be.calledOnce;
  });

  it('should delete Survey in db and s3', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    const getSurveyAttachmentsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyAttachments')
      .resolves([{ key: 'key' } as unknown as ISurveyAttachment]);

    const deleteSurveyStub = sinon.stub(SurveyService.prototype, 'deleteSurvey').resolves();

    const fileUtilsStub = sinon.stub(file_utils, 'deleteFileFromS3').resolves(true as unknown as S3.DeleteObjectOutput);

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

    const result = del.deleteSurvey();

    await result(sampleReq, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(true);
    expect(getSurveyAttachmentsStub).to.be.calledOnce;
    expect(deleteSurveyStub).to.be.calledOnce;
    expect(fileUtilsStub).to.be.calledOnce;
  });
});
