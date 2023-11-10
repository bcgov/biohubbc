import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSurveys } from '.';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { PublishStatus } from '../../../../repositories/history-publish-repository';
import { SurveyService } from '../../../../services/survey-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';

chai.use(sinonChai);

describe('survey list', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should catch and re-throw an error if fetching surveys throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('an error');
    sinon.stub(SurveyService.prototype, 'getSurveysBasicFieldsByProjectId').rejects(expectedError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq['keycloak_token'] = {};
    mockReq.params = {
      projectId: '1'
    };

    try {
      const result = getSurveys();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });

  it('should return an array of surveys', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const surveyId1 = 1;
    const mockSurveyResponse1 = {
      survey_id: surveyId1,
      name: 'Survey 1',
      start_date: '2023-01-01',
      end_date: null,
      focal_species: [1],
      focal_species_names: ['Species 1']
    };

    const surveyId2 = 2;
    const mockSurveyResponse2 = {
      survey_id: surveyId2,
      name: 'Survey 2',
      start_date: '2023-04-04',
      end_date: '2024-05-05',
      focal_species: [1, 2],
      focal_species_names: ['Species 1', 'Species 2']
    };

    const getSurveysBasicFieldsByProjectIdStub = sinon
      .stub(SurveyService.prototype, 'getSurveysBasicFieldsByProjectId')
      .resolves([mockSurveyResponse1, mockSurveyResponse2]);

    const surveyPublishStatusStub = sinon
      .stub(SurveyService.prototype, 'surveyPublishStatus')
      .onFirstCall()
      .resolves(PublishStatus.SUBMITTED)
      .onSecondCall()
      .resolves(PublishStatus.UNSUBMITTED);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const projectId = 3;
    mockReq['keycloak_token'] = {};
    mockReq.params = {
      projectId: String(projectId)
    };

    const expectedResponse = [
      {
        surveyData: mockSurveyResponse1,
        surveySupplementaryData: { publishStatus: PublishStatus.SUBMITTED }
      },
      {
        surveyData: mockSurveyResponse2,
        surveySupplementaryData: { publishStatus: PublishStatus.UNSUBMITTED }
      }
    ];

    const result = getSurveys();

    await result(mockReq, mockRes, mockNext);

    expect(getSurveysBasicFieldsByProjectIdStub).to.be.calledOnceWith(projectId);
    expect(surveyPublishStatusStub).to.be.calledWith(surveyId1);
    expect(surveyPublishStatusStub).to.be.calledWith(surveyId2);
    expect(mockRes.jsonValue).to.eql(expectedResponse);
  });
});
