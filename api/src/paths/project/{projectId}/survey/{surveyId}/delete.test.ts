import { DeleteObjectOutput } from 'aws-sdk/clients/s3';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import survey_queries from '../../../../../queries/survey';
import { PlatformService } from '../../../../../services/platform-service';
import * as file_utils from '../../../../../utils/file-utils';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as delete_survey from './delete';

chai.use(sinonChai);

describe('deleteSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      surveyId: 1
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
      const result = delete_survey.deleteSurvey();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw a 400 error when no sql statement returned', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(null);

    try {
      const result = delete_survey.deleteSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when failed to get result for survey attachments', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);

    try {
      const result = delete_survey.deleteSurvey();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get survey attachments');
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

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteSurveySQL').returns(SQL`something`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves(null);

    const result = delete_survey.deleteSurvey();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });

  it('should return true boolean response on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ key: 's3Key' }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getSurveyAttachmentsSQL').returns(SQL`something`);
    sinon.stub(survey_queries, 'deleteSurveySQL').returns(SQL`something`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves('non null response' as DeleteObjectOutput);

    sinon.stub(PlatformService.prototype, 'submitDwCAMetadataPackage').resolves();

    const result = delete_survey.deleteSurvey();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(true);
  });
});
