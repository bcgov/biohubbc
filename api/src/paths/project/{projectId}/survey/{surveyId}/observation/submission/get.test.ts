import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as observationSubmission from './get';
import * as db from '../../../../../../../database/db';
import * as survey_occurrence_queries from '../../../../../../../queries/survey/survey-occurrence-queries';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('getObservationSubmission', () => {
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
      const result = observationSubmission.getOccurrenceSubmission();
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

  it('should throw a 400 error when no sql statement returned for getLatestSurveyOccurrenceSubmission', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_occurrence_queries, 'getLatestSurveyOccurrenceSubmissionSQL').returns(null);

    try {
      const result = observationSubmission.getOccurrenceSubmission();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL getLatestSurveyOccurrenceSubmissionSQL statement');
    }
  });

  it('should return an observation submission, on success with no rejected files', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 13,
          input_file_name: 'dwca_moose.zip',
          submission_status_type_name: 'Darwin Core Validated',
          messages: [{}]
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

    sinon.stub(survey_occurrence_queries, 'getLatestSurveyOccurrenceSubmissionSQL').returns(SQL`something`);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Darwin Core Validated',
      messages: []
    });
  });

  it('should throw a 400 error with rejected files when failed to getOccurrenceSubmissionMessagesSQL', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 13,
          input_file_name: 'dwca_moose.zip',
          message: 'some message',
          submission_status_type_name: 'Rejected'
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

    sinon.stub(survey_occurrence_queries, 'getLatestSurveyOccurrenceSubmissionSQL').returns(SQL`something`);
    sinon.stub(survey_occurrence_queries, 'getOccurrenceSubmissionMessagesSQL').returns(null);

    try {
      const result = observationSubmission.getOccurrenceSubmission();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL getOccurrenceSubmissionMessagesSQL statement');
    }
  });

  it('should return an observation submission on success, with rejected files', async () => {
    const mockQuery = sinon.stub();

    mockQuery
      .onFirstCall()
      .resolves({
        rows: [
          {
            id: 13,
            input_file_name: 'dwca_moose.zip',
            messages: [],
            submission_status_type_name: 'Rejected'
          }
        ]
      })
      .onSecondCall()
      .resolves({
        rows: [
          {
            errorCode: 'Missing Required Header',
            id: 1,
            message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
            status: 'Rejected',
            type: 'Error'
          },
          {
            errorCode: 'Missing Required Header',
            id: 2,
            message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
            status: 'Rejected',
            type: 'Error'
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

    sinon.stub(survey_occurrence_queries, 'getLatestSurveyOccurrenceSubmissionSQL').returns(SQL`something`);
    sinon.stub(survey_occurrence_queries, 'getOccurrenceSubmissionMessagesSQL').returns(SQL`something`);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Rejected',
      messages: [
        {
          errorCode: 'Missing Required Header',
          id: 1,
          message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
          status: 'Rejected',
          type: 'Error'
        },
        {
          errorCode: 'Missing Required Header',
          id: 2,
          message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
          status: 'Rejected',
          type: 'Error'
        }
      ]
    });
  });

  it('should return null if the survey has no observation submission, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: undefined });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_occurrence_queries, 'getLatestSurveyOccurrenceSubmissionSQL').returns(SQL`something`);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
