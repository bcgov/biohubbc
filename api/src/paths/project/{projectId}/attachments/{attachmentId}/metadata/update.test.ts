import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import * as update_project_metadata from './update';

chai.use(sinonChai);

describe('updates metadata for a project report', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when the response is null', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: {
        attachment_type: 'Report',
        revision_count: 1,
        attachment_meta: {
          title: 'My report',
          year_published: 2000,
          description: 'report abstract',
          authors: [
            {
              first_name: 'John',
              last_name: 'Smith'
            }
          ]
        }
      },
      params: {
        projectId: '1',
        attachmentId: '1'
      }
    } as any;

    const expectedError = new Error('cannot process request');
    sinon.stub(AttachmentService.prototype, 'updateProjectReportAttachmentMetadata').rejects(expectedError);

    try {
      const result = update_project_metadata.updateProjectAttachmentMetadata();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should update a project report metadata, on success', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      keycloak_token: {},
      body: {
        attachment_type: 'Report',
        revision_count: 1,
        attachment_meta: {
          title: 'My report',
          year_published: 2000,
          description: 'report abstract',
          authors: [
            {
              first_name: 'John',
              last_name: 'Smith'
            }
          ]
        }
      },
      params: {
        projectId: '1',
        attachmentId: '1'
      }
    } as any;

    const updateProjectReportAttachmentMetadataStub = sinon
      .stub(AttachmentService.prototype, 'updateProjectReportAttachmentMetadata')
      .resolves();
    const deleteProjectReportAttachmentAuthorsStub = sinon
      .stub(AttachmentService.prototype, 'deleteProjectReportAttachmentAuthors')
      .resolves();
    const insertProjectReportAttachmentAuthorStub = sinon
      .stub(AttachmentService.prototype, 'insertProjectReportAttachmentAuthor')
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

    const requestHandler = update_project_metadata.updateProjectAttachmentMetadata();
    await requestHandler(sampleReq, (sampleRes as unknown) as any, (null as unknown) as any);

    expect(actualResult).to.equal(undefined);
    expect(updateProjectReportAttachmentMetadataStub).to.be.calledOnce;
    expect(deleteProjectReportAttachmentAuthorsStub).to.be.calledOnce;
    expect(insertProjectReportAttachmentAuthorStub).to.be.calledOnce;
  });
});
