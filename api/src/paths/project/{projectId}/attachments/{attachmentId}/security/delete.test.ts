import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import * as deleteSecurity from './delete';

chai.use(sinonChai);

describe('deleteProjectSecurityReasons', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'removeAllSecurityFromProjectReportAttachment').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report', security_ids: [] },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    try {
      const result = deleteSecurity.deleteProjectSecurityReasons();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should delete all security from Project `Report` Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report', security_ids: [] },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const removeAllSecurityFromProjectReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeAllSecurityFromProjectReportAttachment')
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

    const result = deleteSecurity.deleteProjectSecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeAllSecurityFromProjectReportAttachmentStub).to.be.calledOnce;
  });

  it('should delete all security Rules from Project `Report` Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report', security_ids: [1] },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const removeSecurityRulesFromProjectReportAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeSecurityRulesFromProjectReportAttachment')
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

    const result = deleteSecurity.deleteProjectSecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeSecurityRulesFromProjectReportAttachmentStub).to.be.calledOnce;
  });

  it('should delete all security from Project Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Attachment', security_ids: [] },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const removeAllSecurityFromProjectAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeAllSecurityFromProjectAttachment')
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

    const result = deleteSecurity.deleteProjectSecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeAllSecurityFromProjectAttachmentStub).to.be.calledOnce;
  });

  it('should delete all security Rules from Project Attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Attachment', security_ids: [1] },
      params: {
        projectId: 1,
        attachmentId: 2
      }
    } as any;

    const removeSecurityRulesFromProjectAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'removeSecurityRulesFromProjectAttachment')
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

    const result = deleteSecurity.deleteProjectSecurityReasons();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(undefined);
    expect(removeSecurityRulesFromProjectAttachmentStub).to.be.calledOnce;
  });
});
