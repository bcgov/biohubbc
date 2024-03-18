import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import {
  IProjectReportAttachment,
  IProjectReportAttachmentAuthor
} from '../../../../../../repositories/attachment-repository';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import * as get from './get';

chai.use(sinonChai);

describe('getProjectReportDetails', () => {
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
    sinon.stub(AttachmentService.prototype, 'getProjectReportAttachmentById').rejects(expectedError);

    try {
      const result = get.getProjectReportDetails();

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

    const getProjectReportAttachmentByIdStub = sinon
      .stub(AttachmentService.prototype, 'getProjectReportAttachmentById')
      .resolves(({ project_report_attachment_id: 1 } as unknown) as IProjectReportAttachment);

    const getProjectReportAttachmentAuthorsStub = sinon
      .stub(AttachmentService.prototype, 'getProjectReportAttachmentAuthors')
      .resolves([({ author: 2 } as unknown) as IProjectReportAttachmentAuthor]);

    const expectedResponse = {
      metadata: { project_report_attachment_id: 1 },
      authors: [{ author: 2 }]
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

    const result = get.getProjectReportDetails();
    await result(mockReq, (sampleRes as unknown) as any, (null as unknown) as any);

    expect(actualResult).to.eql(expectedResponse);
    expect(getProjectReportAttachmentByIdStub).to.be.calledOnce;
    expect(getProjectReportAttachmentAuthorsStub).to.be.calledOnce;
  });
});
