import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as view from './view';
import * as db from '../../../../../../../../database/db';
import * as survey_occurrence_queries from '../../../../../../../../queries/survey/survey-occurrence-queries';
import SQL from 'sql-template-strings';
import * as file_utils from '../../../../../../../../utils/file-utils';
import { GetObjectOutput } from 'aws-sdk/clients/s3';

chai.use(sinonChai);

describe('getObservationSubmissionCSVForView', () => {
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
      submissionId: 1
    }
  } as any;

  // let actualResult: any = null;

  // const sampleRes = {
  //   status: () => {
  //     return {
  //       json: (result: any) => {
  //         actualResult = result;
  //       }
  //     };
  //   }
  // };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = view.getObservationSubmissionCSVForView();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no surveyId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = view.getObservationSubmissionCSVForView();
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

  it('should throw a 400 error when no submissionId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = view.getObservationSubmissionCSVForView();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, submissionId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required path param `submissionId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for getSurveySubmissionOccurrenceSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_occurrence_queries, 'getSurveySubmissionOccurrenceSQL').returns(null);

    try {
      const result = view.getObservationSubmissionCSVForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 500 error when no s3 file fetched', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 13,
          file_name: 'filename.txt'
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

    sinon.stub(survey_occurrence_queries, 'getSurveySubmissionOccurrenceSQL').returns(SQL`something`);
    sinon.stub(file_utils, 'generateS3FileKey').resolves('validkey');
    sinon.stub(file_utils, 'getFileFromS3').resolves((null as unknown) as GetObjectOutput);

    try {
      const result = view.getObservationSubmissionCSVForView();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(500);
      expect(actualError.message).to.equal('Failed to retrieve file from S3');
    }
  });
});
