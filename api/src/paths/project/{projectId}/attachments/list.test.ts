import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { HTTPError } from '../../../../errors/http-error';
import * as listAttachments from './list';

chai.use(sinonChai);

describe('getAttachments', () => {
  afterEach(() => {
    sinon.restore();
  });

<<<<<<< HEAD
  it('should throw an error when a failure occurs', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'getProjectAttachmentsWithSecurityCounts').rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1
      }
    } as any;

    try {
=======
  it('should throw a 400 error when projectId is missing in Path', async () => {
    try {
      const sampleReq = {
        keycloak_token: {},
        body: {},
        params: {
          projectId: null
        }
      } as any;

>>>>>>> 4f6ac046158030c698b1238be519a5304210361e
      const result = listAttachments.getAttachments();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
<<<<<<< HEAD
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

    const getProjectAttachmentsWithSecurityCountsStub = sinon
      .stub(AttachmentService.prototype, 'getProjectAttachmentsWithSecurityCounts')
      .resolves([]);
    const getProjectReportAttachmentsWithSecurityCountsStub = sinon
      .stub(AttachmentService.prototype, 'getProjectReportAttachmentsWithSecurityCounts')
      .resolves([]);

    const sampleReq = {
      keycloak_token: {},
      body: {},
      params: {
        projectId: 1
      }
    } as any;

    const expectedResponse = new GetAttachmentsData([], []);

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

    const result = listAttachments.getAttachments();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(getProjectAttachmentsWithSecurityCountsStub).to.be.calledOnce;
    expect(getProjectReportAttachmentsWithSecurityCountsStub).to.be.calledOnce;
  });
=======
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });
>>>>>>> 4f6ac046158030c698b1238be519a5304210361e
});
