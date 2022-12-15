import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../../../../__mocks__/db';
import * as update from './update';

chai.use(sinonChai);

describe('updateSurveyAttachmentSecurityReviewTime', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'addSecurityReviewTimeToSurveyReportAttachment').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report' },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    try {
      const result = update.updateSurveyAttachmentSecurityReviewTime();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should update Project Report Attachment Security Review', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report' },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const addSecurityReviewTimeToSurveyReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'addSecurityReviewTimeToSurveyReportAttachment')
      .resolves();

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

    const result = update.updateSurveyAttachmentSecurityReviewTime();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(addSecurityReviewTimeToSurveyReportAttachmentStub).to.be.calledOnce;
  });

  it('should update Project Attachment Security Review', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Attachment' },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const addSecurityReviewTimeToSurveyAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'addSecurityReviewTimeToSurveyAttachment')
      .resolves();

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

    const result = update.updateSurveyAttachmentSecurityReviewTime();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(addSecurityReviewTimeToSurveyAttachmentStub).to.be.calledOnce;
  });
});
