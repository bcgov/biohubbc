import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { findSurveys, getSurveys } from '.';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { FindSurveysResponse } from '../../models/survey-view';
import { SurveyService } from '../../services/survey-service';
import { KeycloakUserInformation } from '../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';

chai.use(sinonChai);

describe('survey list', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should catch and re-throw an error if fetching surveys throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedError = new Error('an error');
    sinon.stub(SurveyService.prototype, 'getSurveysBasicFields').rejects(expectedError);

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

    const getSurveysBasicFieldsStub = sinon
      .stub(SurveyService.prototype, 'getSurveysBasicFields')
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

    expect(getSurveysBasicFieldsStub).to.be.calledOnceWith(projectId);
    expect(mockRes.jsonValue).to.eql(expectedResponse);
  });
});

chai.use(sinonChai);

describe('findSurveys', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns surveys', async () => {
    const mockFindSurveysResponse: FindSurveysResponse[] = [
      {
        survey_id: 2,
        name: 'survey name',
        progress_id: 3,
        regions: ['region1'],
        start_date: '2021-01-01',
        end_date: '2021-01-31',
        focal_species: [123, 456],
        types: [1, 2]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findSurveysStub = sinon.stub(SurveyService.prototype, 'findSurveys').resolves(mockFindSurveysResponse);

    const findSurveysCountStub = sinon.stub(SurveyService.prototype, 'findSurveysCount').resolves(50);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      system_user_id: '11',
      survey_name: 'survey name',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      system_user_id: 20,
      user_guid: '123-456-789',
      user_identifier: 'test-identifier',
      identity_source: 'IDIR',
      display_name: 'test-user',
      given_name: 'test-given',
      family_name: 'test-family',
      email: 'test-email',
      agency: 'test-agency',
      record_end_date: null,
      role_ids: [1],
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    const requestHandler = findSurveys();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findSurveysStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findSurveysCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.jsonValue.surveys).to.eql(mockFindSurveysResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindSurveysResponse: FindSurveysResponse[] = [
      {
        survey_id: 2,
        name: 'survey name',
        progress_id: 3,
        regions: ['region1'],
        start_date: '2021-01-01',
        end_date: '2021-01-31',
        focal_species: [123, 456],
        types: [1, 2]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findSurveysStub = sinon.stub(SurveyService.prototype, 'findSurveys').resolves(mockFindSurveysResponse);

    const findSurveysCountStub = sinon
      .stub(SurveyService.prototype, 'findSurveysCount')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      survey_name: 'survey name',
      system_user_id: '11',
      page: '2',
      limit: '10',
      sort: undefined,
      order: undefined
    };
    mockReq.keycloak_token = {} as KeycloakUserInformation;
    mockReq.system_user = {
      system_user_id: 20,
      user_guid: '123-456-789',
      user_identifier: 'test-identifier',
      identity_source: 'IDIR',
      display_name: 'test-user',
      given_name: 'test-given',
      family_name: 'test-family',
      email: 'test-email',
      agency: 'test-agency',
      record_end_date: null,
      role_ids: [3],
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    };

    const requestHandler = findSurveys();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findSurveysStub).to.have.been.calledOnceWith(false, 20, sinon.match.object, sinon.match.object);
      expect(findSurveysCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
