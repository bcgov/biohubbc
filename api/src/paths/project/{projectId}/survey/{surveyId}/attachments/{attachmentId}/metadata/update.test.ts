import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as update_survey_metadata from './update';
import * as db from '../../../../../../../../database/db';
import * as survey_attachment_queries from '../../../../../../../../queries/survey/survey-attachments-queries';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../../../../../__mocks__/db';
import { CustomError } from '../../../../../../../../errors/CustomError';

chai.use(sinonChai);

describe('updates metadata for a survey report', () => {
  const dbConnectionObj = getMockDBConnection();

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
      projectId: 1,
      surveyId: 1,
      attachmentId: 1
    }
  } as any;

  let actualResult: number = (null as unknown) as number;

  const sampleRes = {
    status: (status: number) => {
      return {
        send: () => {
          actualResult = status;
        }
      };
    }
  };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveyId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = update_survey_metadata.updateSurveyAttachmentMetadata();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no attachmentId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = update_survey_metadata.updateSurveyAttachmentMetadata();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, attachmentId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required path param `attachmentId`');
    }
  });

  it('should throw a 400 error when attachment_type is invalid', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = update_survey_metadata.updateSurveyAttachmentMetadata();
      await result(
        { ...sampleReq, body: { ...sampleReq.body, attachment_type: 'notAReport' } },
        (null as unknown) as any,
        (null as unknown) as any
      );

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Invalid body param `attachment_type`');
    }
  });

  it('should update a survey report metadata, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });
    mockQuery.onCall(1).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    const result = update_survey_metadata.updateSurveyAttachmentMetadata();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(200);
  });

  it('should throw a 400 error when updateSurveyReportAttachmentMetadataSQL returns null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_attachment_queries, 'updateSurveyReportAttachmentMetadataSQL').returns(null);

    const result = update_survey_metadata.updateSurveyAttachmentMetadata();

    try {
      await result(sampleReq, sampleRes as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to build SQL update attachment report statement');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });

  it('should throw a 400 error when the response is null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onCall(0).resolves({
      rowCount: null
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_attachment_queries, 'updateSurveyReportAttachmentMetadataSQL').returns(SQL`something`);

    const result = update_survey_metadata.updateSurveyAttachmentMetadata();

    try {
      await result(sampleReq, sampleRes as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).message).to.equal('Failed to update attachment report record');
      expect((actualError as CustomError).status).to.equal(400);
    }
  });
});
