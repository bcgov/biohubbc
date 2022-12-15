import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../errors/http-error';
import {
  IProjectReportAttachment,
  IReportAttachmentAuthor,
  ISurveyReportSecurityReason
} from '../../../../../../../../repositories/attachment-repository';
import { AttachmentService } from '../../../../../../../../services/attachment-service';
import { SecuritySearchService } from '../../../../../../../../services/security-search-service';
import { getMockDBConnection } from '../../../../../../../../__mocks__/db';
import * as get from './get';

chai.use(sinonChai);

describe('getSurveyReportDetails', () => {
  afterEach(() => {
    sinon.restore();
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
      body: {}
    } as any;

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'getSurveyReportAttachmentById').rejects(expectedError);

    try {
      const result = get.getSurveyReportDetails();

      await result(mockReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid params', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockReq = {
      keycloak_token: {},
      params: {
        projectId: 1,
        attachmentId: 2
      },
      body: {}
    } as any;

    const getSurveyReportAttachmentByIdStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyReportAttachmentById')
      .resolves(({ report: 1 } as unknown) as IProjectReportAttachment);

    const getSurveyAttachmentAuthorsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyAttachmentAuthors')
      .resolves([({ author: 2 } as unknown) as IReportAttachmentAuthor]);

    const getSurveyReportAttachmentSecurityReasonsStub = sinon
      .stub(AttachmentService.prototype, 'getSurveyReportAttachmentSecurityReasons')
      .resolves([
        ({
          persecution_security_id: 1,
          user_identifier: 'user',
          create_date: 'date'
        } as unknown) as ISurveyReportSecurityReason
      ]);

    const getPersecutionSecurityRulesStub = sinon
      .stub(SecuritySearchService.prototype, 'getPersecutionSecurityRules')
      .resolves([
        {
          reasonTitle: 'title',
          reasonDescription: 'desc',
          expirationDate: 'date'
        }
      ]);

    const expectedResponse = {
      metadata: { report: 1 },
      authors: [{ author: 2 }],
      security_reasons: [
        {
          security_reason_id: 1,
          security_reason_title: 'title',
          security_reason_description: 'desc',
          date_expired: 'date',
          user_identifier: 'user',
          security_date_applied: 'date'
        }
      ]
    };

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

    const result = get.getSurveyReportDetails();
    await result(mockReq, (sampleRes as unknown) as any, (null as unknown) as any);

    expect(actualResult).to.eql(expectedResponse);
    expect(getSurveyReportAttachmentByIdStub).to.be.calledOnce;
    expect(getSurveyAttachmentAuthorsStub).to.be.calledOnce;
    expect(getSurveyReportAttachmentSecurityReasonsStub).to.be.calledOnce;
    expect(getPersecutionSecurityRulesStub).to.be.calledOnce;
  });
});
