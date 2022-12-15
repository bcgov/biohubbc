import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import * as list from './list';

chai.use(sinonChai);

describe('getSurveyAttachments', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'getSurveyAttachmentsWithSecurityCounts').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        surveyId: 2
      }
    } as any;

    try {
      const result = list.getSurveyAttachments();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should get Survey Attachments and Reports', async () => {
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

    const getSurveyAttachmentsWithSecurityCountsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyAttachmentsWithSecurityCounts')
      .resolves([]);

    const getSurveyReportAttachmentsWithSecurityCountsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyReportAttachmentsWithSecurityCounts')
      .resolves([]);

    const expectedResult = { attachmentsList: [], reportAttachmentsList: [] };

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

    const result = list.getSurveyAttachments();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(expectedResult);
    expect(getSurveyAttachmentsWithSecurityCountsStub).to.be.calledOnce;
    expect(getSurveyReportAttachmentsWithSecurityCountsStub).to.be.calledOnce;
  });
});
