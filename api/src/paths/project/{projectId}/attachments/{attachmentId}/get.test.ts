import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import {
  IProjectAttachment,
  IProjectAttachmentSecurityReason,
  IProjectReportSecurityReason
} from '../../../../../repositories/attachment-repository';
import { AttachmentService } from '../../../../../services/attachment-service';
import { SecuritySearchService } from '../../../../../services/security-search-service';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as get from './get';

chai.use(sinonChai);

describe('getProjectAttachmentDetails', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'getProjectAttachmentById').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    try {
      const result = get.getProjectAttachmentDetails();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid Id', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const getProjectAttachmentByIdStub = sinon
      .stub(AttachmentService.prototype, 'getProjectAttachmentById')
      .resolves(({ create_date: 'date' } as unknown) as IProjectAttachment);

    const getProjectAttachmentSecurityReasonsStub = sinon
      .stub(AttachmentService.prototype, 'getProjectAttachmentSecurityReasons')
      .resolves([
        ({
          persecution_security_id: 1,
          user_identifier: 'user',
          create_date: 'date'
        } as unknown) as IProjectAttachmentSecurityReason
      ]);

    const getPersecutionSecurityRulesStub = sinon
      .stub(SecuritySearchService.prototype, 'getPersecutionSecurityRules')
      .resolves([
        ({
          reasonTitle: 'title',
          reasonDescription: 'desc',
          expirationDate: 'date'
        } as unknown) as IProjectReportSecurityReason
      ]);

    const expectedResponse = {
      metadata: { last_modified: 'date' },
      security_reasons: [
        {
          security_reason_id: 1,
          security_reason_title: 'title',
          security_reason_description: 'desc',
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

    const result = get.getProjectAttachmentDetails();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(getProjectAttachmentByIdStub).to.be.calledOnce;
    expect(getProjectAttachmentSecurityReasonsStub).to.be.calledOnce;
    expect(getPersecutionSecurityRulesStub).to.be.calledOnce;
  });
});
