import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { findSurveysSpatial } from '.';
import { SYSTEM_ROLE } from '../../../constants/roles';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { FindSurveysSpatialResponse } from '../../../models/survey-view';
import { SurveyService } from '../../../services/survey-service';
import { KeycloakUserInformation } from '../../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';

chai.use(sinonChai);

describe('findSurveysSpatial', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns projects', async () => {
    const mockFindSurveysSpatialResponse: FindSurveysSpatialResponse[] = [
      {
        survey_id: 1,
        project_id: 1,
        survey_location_id: 1,
        geojson: []
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findSurveysSpatialStub = sinon
      .stub(SurveyService.prototype, 'findSurveysSpatial')
      .resolves(mockFindSurveysSpatialResponse);

    const findSurveysSpatialCountStub = sinon.stub(SurveyService.prototype, 'findSurveysCount').resolves(50);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      system_user_id: '11',
      survey_name: 'survey name',
      sproject_name: 'project name',
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

    const requestHandler = findSurveysSpatial();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findSurveysSpatialStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findSurveysSpatialCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.jsonValue.surveys).to.eql(mockFindSurveysSpatialResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindSurveysSpatialResponse: FindSurveysSpatialResponse[] = [
      {
        survey_id: 1,
        project_id: 1,
        survey_location_id: 1,
        geojson: []
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

    const findSurveysSpatialStub = sinon
      .stub(SurveyService.prototype, 'findSurveysSpatial')
      .resolves(mockFindSurveysSpatialResponse);

    const findSurveysSpatialCountStub = sinon
      .stub(SurveyService.prototype, 'findSurveysCount')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      system_user_id: '11',
      project_name: 'project name',
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
      role_ids: [3],
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    };

    const requestHandler = findSurveysSpatial();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findSurveysSpatialStub).to.have.been.calledOnceWith(false, 20, sinon.match.object, sinon.match.object);
      expect(findSurveysSpatialCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
