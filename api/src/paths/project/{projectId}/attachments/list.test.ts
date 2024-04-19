import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { AttachmentService } from '../../../../services/attachment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import * as list from './list';
chai.use(sinonChai);

describe('getAttachments', () => {
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

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const expectedError = new Error('cannot process request');

    sinon.stub(AttachmentService.prototype, 'getProjectAttachments').rejects(expectedError);

    try {
      const result = list.getAttachments();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should succeed with valid params', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const getProjectAttachmentsStub = sinon.stub(AttachmentService.prototype, 'getProjectAttachments').resolves([]);
    sinon.stub(AttachmentService.prototype, 'getProjectReportAttachments').resolves([]);

    const expectedResponse = { attachmentsList: [], reportAttachmentsList: [] };

    const mockReq = {
      keycloak_token: {},
      params: {
        projectId: 1,
        attachmentId: 2
      },
      body: {}
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

    const result = list.getAttachments();

    await result(mockReq as unknown as any, sampleRes as unknown as any, null as unknown as any);
    expect(actualResult).to.eql(expectedResponse);
    expect(getProjectAttachmentsStub).to.be.calledOnce;
  });
});
