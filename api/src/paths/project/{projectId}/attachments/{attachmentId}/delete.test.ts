import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/http-error';
import { AttachmentService } from '../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as deleteAttachment from './delete';

chai.use(sinonChai);

describe('deleteAttachment', () => {
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
    const handleDeleteProjectAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'handleDeleteProjectAttachment')
      .rejects(expectedError);

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report' },
      params: {
        projectId: 1,
        attachmentId: 2
      },
      system_user: {
        role_names: ['test']
      }
    } as any;

    try {
      const result = deleteAttachment.deleteAttachment();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(handleDeleteProjectAttachmentStub).to.be.calledOnce;
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should return 200 when deleting a project attachment', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    const handleDeleteProjectAttachmentStub = sinon
      .stub(AttachmentService.prototype, 'handleDeleteProjectAttachment')
      .resolves();

    const sampleReq = {
      keycloak_token: {},
      body: { attachmentType: 'Report' },
      params: {
        projectId: 1,
        attachmentId: 2
      },
      system_user: {
        role_names: ['test']
      }
    } as any;

    const sampleRes = {
      status: () => {
        return {
          send: () => {
            return;
          }
        };
      }
    };

    const result = deleteAttachment.deleteAttachment();

    await result(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);

    expect(handleDeleteProjectAttachmentStub).to.be.calledOnceWith(1, 2, 'Report');
  });
});
