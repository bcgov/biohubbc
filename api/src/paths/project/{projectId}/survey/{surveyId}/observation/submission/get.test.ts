import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  MESSAGE_CLASS_NAME,
  SUBMISSION_MESSAGE_TYPE,
  SUBMISSION_STATUS_TYPE
} from '../../../../../../../constants/status';
import * as db from '../../../../../../../database/db';
import {
  IGetLatestSurveyOccurrenceSubmission,
  SurveyRepository
} from '../../../../../../../repositories/survey-repository';
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
      submission_status_type_name: 'Darwin Core Validated'
    } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Darwin Core Validated',
      isValidating: true,
      messageTypes: []
    });
  });

  it('should return an observation submission on success, with rejected files', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(SurveyService.prototype, 'getLatestSurveyOccurrenceSubmission').resolves(({
      id: 13,
      input_file_name: 'dwca_moose.zip',
      submission_status_type_name: 'Rejected'
    } as unknown) as IGetLatestSurveyOccurrenceSubmission);

    sinon.stub(SurveyRepository.prototype, 'getOccurrenceSubmissionMessages').resolves([
      {
        id: 1,
        message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
        status: SUBMISSION_STATUS_TYPE.REJECTED,
        type: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
        class: MESSAGE_CLASS_NAME.ERROR
      },
      {
        id: 2,
        message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header',
        status: SUBMISSION_STATUS_TYPE.REJECTED,
        type: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
        class: MESSAGE_CLASS_NAME.ERROR
      }
    ]);

    const result = observationSubmission.getOccurrenceSubmission();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      id: 13,
      inputFileName: 'dwca_moose.zip',
      status: 'Rejected',
      isValidating: false,
      messageTypes: [
        {
          severityLabel: 'Error',
          messageTypeLabel: 'Missing Required Header',
          messageStatus: 'Rejected',
          messages: [
            {
              id: 1,
              message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header'
            },
            {
              id: 2,
              message: 'occurrence.txt - Missing Required Header - associatedTaxa - Missing required header'
            }
          ]
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
