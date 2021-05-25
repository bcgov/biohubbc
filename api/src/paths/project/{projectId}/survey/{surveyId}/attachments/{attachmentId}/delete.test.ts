import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as delete_attachment from './delete';
import * as db from '../../../../../../../database/db';
import * as survey_attachments_queries from '../../../../../../../queries/survey/survey-attachments-queries';
import SQL from 'sql-template-strings';
import * as file_utils from '../../../../../../../utils/file-utils';
import { DeleteObjectOutput } from 'aws-sdk/clients/s3';

chai.use(sinonChai);

describe('deleteAttachment', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = {
    systemUserId: () => {
      return null;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      // do nothing
    }
  };

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 1,
      attachmentId: 2
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw an error when surveyId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw an error when attachmentId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, attachmentId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `attachmentId`');
    }
  });

  it('should throw a 400 error when no sql statement returned', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_attachments_queries, 'deleteSurveyAttachmentSQL').returns(null);

    try {
      const result = delete_attachment.deleteAttachment();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL delete statement');
    }
  });

  it('should return null when deleting file from S3 fails', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ key: 's3Key' }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_attachments_queries, 'deleteSurveyAttachmentSQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves(null);

    const result = delete_attachment.deleteAttachment();

    expect(await result(sampleReq, (null as unknown) as any, (null as unknown) as any)).to.equal(null);
  });

  it('should return the rowCount response on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ key: 's3Key' }], rowCount: 1 });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_attachments_queries, 'deleteSurveyAttachmentSQL').returns(SQL`some query`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves('non null response' as DeleteObjectOutput);

    const result = delete_attachment.deleteAttachment();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql(1);
  });
});
