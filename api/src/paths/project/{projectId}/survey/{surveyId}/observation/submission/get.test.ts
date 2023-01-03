import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE } from '../../../../../../../constants/status';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import survey_queries from '../../../../../../../queries/survey';
import { IGetLatestSurveyOccurrenceSubmission } from '../../../../../../../repositories/survey-repository';
import { SurveyService } from '../../../../../../../services/survey-service';
import { getMockDBConnection } from '../../../../../../../__mocks__/db';
import * as observationSubmission from './get';

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
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should return an observation submission, on success with no rejected files', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission').resolves(({
      id: 13,
      input_file_name: 'dwca_moose.zip',
      submission_status_type_name: 'Darwin Core Validated',
      message: 'string'
    } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Darwin Core Validated',
      messages: []
    });
  });

  it('should return an observation submission on success, with rejected files', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
          id: 1,
          message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
          status: 'Rejected',
          type: 'Error'
        },
        {
          errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
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

    sinon.stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission').resolves(({
      id: 13,
      input_file_name: 'dwca_moose.zip',
      submission_status_type_name: 'Rejected'
    } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    sinon.stub(survey_queries, 'getOccurrenceSubmissionMessagesSQL').returns(SQL`something`);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Rejected',
      messages: [
        {
          errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
          id: 1,
          message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
          status: 'Rejected',
          type: 'Error'
        },
        {
          errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
          id: 2,
          message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
          status: 'Rejected',
          type: 'Error'
        }
      ]
    });
  });

  it('should return null if the survey has no observation submission, on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon
      .stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission')
      .resolves(({ delete_timestamp: true } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
