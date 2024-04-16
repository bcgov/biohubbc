import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../errors/http-error';
import { AttachmentService } from '../../../../../../../../services/attachment-service';
import { getMockDBConnection } from '../../../../../../../../__mocks__/db';
import * as update_survey_metadata from './update';

chai.use(sinonChai);

describe('updates metadata for a survey report', () => {
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
    sinon.stub(AttachmentService.prototype, 'updateSurveyReportAttachmentMetadata').rejects(expectedError);

    try {
      const result = update_survey_metadata.updateSurveyReportMetadata();

      await result(sampleReq, null as unknown as any, null as unknown as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should update a survey report metadata, on success', async () => {
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

    const updateSurveyReportAttachmentMetadataStub = sinon
      .stub(AttachmentService.prototype, 'updateSurveyReportAttachmentMetadata')
      .resolves();
    const deleteSurveyReportAttachmentAuthorsStub = sinon
      .stub(AttachmentService.prototype, 'deleteSurveyReportAttachmentAuthors')
      .resolves();
    const insertSurveyReportAttachmentAuthorStub = sinon
      .stub(AttachmentService.prototype, 'insertSurveyReportAttachmentAuthor')
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

    const requestHandler = update_survey_metadata.updateSurveyReportMetadata();
    await requestHandler(sampleReq, sampleRes as unknown as any, null as unknown as any);

    expect(actualResult).to.equal(undefined);
    expect(updateSurveyReportAttachmentMetadataStub).to.be.calledOnce;
    expect(deleteSurveyReportAttachmentAuthorsStub).to.be.calledOnce;
    expect(insertSurveyReportAttachmentAuthorStub).to.be.calledOnce;
  });
});
