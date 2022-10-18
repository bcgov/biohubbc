import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import survey_queries from '../../../../../../../queries/survey';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as summarySubmission from './get';

chai.use(sinonChai);

describe('getSummarySubmission', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
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

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveyId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = summarySubmission.getSurveySummarySubmission();
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

  it('should throw a 400 error when no sql statement returned for getLatestSurveySummarySubmissionSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_queries, 'getLatestSurveySummarySubmissionSQL').returns(null);

    try {
      const result = summarySubmission.getSurveySummarySubmission();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal(
        'Failed to build getLatestSurveySummarySubmissionSQLStatement statement'
      );
    }
  });

  it('should return a summary submission, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 13,
          file_name: 'file.xlsx',
          messages: []
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

    sinon.stub(survey_queries, 'getLatestSurveySummarySubmissionSQL').returns(SQL`something`);

    const result = summarySubmission.getSurveySummarySubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      fileName: 'file.xlsx',
      messages: []
    });
  });

  it('should return null if the survey has no summary submission, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: undefined });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_queries, 'getLatestSurveySummarySubmissionSQL').returns(SQL`something`);

    const result = summarySubmission.getSurveySummarySubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
