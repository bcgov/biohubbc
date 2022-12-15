import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../../../__mocks__/db';
import * as deleteSecurity from './delete';

chai.use(sinonChai);

describe('deleteSurveySecurityReasons', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'removeAllSecurityFromSurveyReportAttachment').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report', security_ids: [] },
      params: {
        projectId: 1,
        surveyId: 1,
        attachmentId: 2
      }
    } as any;

    try {
      const result = deleteSecurity.deleteSurveySecurityReasons();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should delete all security from Survey `Report` Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report', security_ids: [] },
      params: {
        projectId: 1,
        surveyId: 1,
        attachmentId: 2
      }
    } as any;

    const removeAllSecurityFromSurveyReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeAllSecurityFromSurveyReportAttachment')
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

    const result = deleteSecurity.deleteSurveySecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeAllSecurityFromSurveyReportAttachmentStub).to.be.calledOnce;
  });

  it('should delete all security Rules from Survey `Report` Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report', security_ids: [1] },
      params: {
        projectId: 1,
        surveyId: 1,
        attachmentId: 2
      }
    } as any;

    const removeSecurityRulesFromSurveyReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeSecurityRulesFromSurveyReportAttachment')
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

    const result = deleteSecurity.deleteSurveySecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeSecurityRulesFromSurveyReportAttachmentStub).to.be.calledOnce;
  });

  it('should delete all security from Survey Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Attachment', security_ids: [] },
      params: {
        projectId: 1,
        surveyId: 1,
        attachmentId: 2
      }
    } as any;

    const removeAllSecurityFromSurveyAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeAllSecurityFromSurveyAttachment')
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

    const result = deleteSecurity.deleteSurveySecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeAllSecurityFromSurveyAttachmentStub).to.be.calledOnce;
  });

  it('should delete all security Rules from Survey Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Attachment', security_ids: [1] },
      params: {
        projectId: 1,
        surveyId: 1,
        attachmentId: 2
      }
    } as any;

    const removeSecurityRulesFromSurveyAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeSecurityRulesFromSurveyAttachment')
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

    const result = deleteSecurity.deleteSurveySecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeSecurityRulesFromSurveyAttachmentStub).to.be.calledOnce;
  });
});
