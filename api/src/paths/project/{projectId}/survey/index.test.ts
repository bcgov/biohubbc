import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSurveys } from '.';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { SurveyService } from '../../../../services/survey-service';
import { KeycloakUserInformation } from '../../../../utils/keycloak-utils';
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

    mockReq.keycloak_token = {} as KeycloakUserInformation;
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

    const mockSurveyA = {
      survey_id: 1001,
      name: 'Survey 1',
      start_date: '2023-01-01',
      progress_id: 1,
      end_date: null,
      focal_species: [1],
      focal_species_names: ['Species 1']
    };

    const mockSurveyB = {
      survey_id: 1002,
      name: 'Survey 2',
      progress_id: 2,
      start_date: '2023-04-04',
      end_date: '2024-05-05',
      focal_species: [1, 2],
      focal_species_names: ['Species 1', 'Species 2']
    };

    const getSurveysBasicFieldsByProjectIdStub = sinon
      .stub(SurveyService.prototype, 'getSurveysBasicFieldsByProjectId')
      .resolves([mockSurveyA, mockSurveyB]);

    sinon.stub(SurveyService.prototype, 'getSurveyCountByProjectId').resolves(2);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const projectId = 3;
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.params = {
      projectId: String(projectId)
    };

    const expectedResponse = {
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 2,
        sort: undefined,
        order: undefined,
        per_page: 2
      },
      surveys: [mockSurveyA, mockSurveyB]
    };

    const result = getSurveys();

    await result(mockReq, mockRes, mockNext);

    expect(getSurveysBasicFieldsByProjectIdStub).to.be.calledOnceWith(projectId);
    expect(mockRes.jsonValue).to.eql(expectedResponse);
  });
});
