import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as add from './add';

chai.use(sinonChai);

describe('addSurveyAttachmentSecurity', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon
      .stub(AttachmentService.prototype, 'addSecurityRulesToSurveyAttachmentsOrSurveyReports')
      .rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: { attachments: [], security_ids: [] },
      params: {
        projectId: 1
      }
    } as any;

    try {
      const result = add.addSurveyAttachmentSecurity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid params', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachments: [], security_ids: [] },
      params: {
        projectId: 1
      }
    } as any;

    const addSecurityRulesToSurveyAttachmentsOrSurveyReportsStub = sinon
      .stub(AttachmentService.prototype, 'addSecurityRulesToSurveyAttachmentsOrSurveyReports')
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

    const result = add.addSurveyAttachmentSecurity();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(addSecurityRulesToSurveyAttachmentsOrSurveyReportsStub).to.be.calledOnce;
  });
});
