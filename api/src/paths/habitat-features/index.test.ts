import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { SurveyHabitatFeatureWithTaxons } from '../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { SurveyHabitatFeatureService } from '../../services/habitat-feature-services/survey-habitat-feature-service';
import { KeycloakUserInformation } from '../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { findSurveyHabitatFeatures } from './index';

chai.use(sinonChai);

describe('findSurveyHabitatFeatures', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns survey habitat feature records', async () => {
    const mockFindSurveyHabitatFeaturesResponse: SurveyHabitatFeatureWithTaxons[] = [
      {
        survey_habitat_feature_id: 1,
        habitat_feature_type_id: 2,
        survey_id: 3,
        count: 4,
        latitude: 5,
        longitude: 6,
        observed_date: '2023-01-01',
        observed_time: '12:00:00',
        survey_sample_period_id: 7,
        survey_habitat_feature_taxons: [
          {
            survey_habitat_feature_taxon_id: 7,
            survey_habitat_feature_id: 1,
            itis_tsn: 6,
            itis_scientific_name: 'itis_scientific_name',
            comment: 'taxon comment'
          }
        ]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findSurveyHabitatFeaturesStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'findSurveyHabitatFeatures')
      .resolves(mockFindSurveyHabitatFeaturesResponse);

    const findSurveyHabitatFeaturesCountStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'findSurveyHabitatFeaturesCount')
      .resolves(50);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      start_time: '00:00:00',
      end_time: '23:59:59',
      min_count: '5',
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
      role_ids: [1],
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    const requestHandler = findSurveyHabitatFeatures();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findSurveyHabitatFeaturesStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findSurveyHabitatFeaturesCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.status).to.have.been.calledOnceWith(200);
    expect(mockRes.json).to.have.been.calledOnceWith({
      surveyHabitatFeatures: mockFindSurveyHabitatFeaturesResponse,
      pagination: {
        total: 50,
        per_page: 10,
        current_page: 2,
        last_page: 5,
        sort: undefined,
        order: undefined
      }
    });

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindSurveyHabitatFeaturesResponse: SurveyHabitatFeatureWithTaxons[] = [
      {
        survey_habitat_feature_id: 1,
        habitat_feature_type_id: 2,
        survey_id: 3,
        count: 4,
        latitude: 5,
        longitude: 6,
        observed_date: '2023-01-01',
        observed_time: '12:00:00',
        survey_sample_period_id: 7,
        survey_habitat_feature_taxons: [
          {
            survey_habitat_feature_taxon_id: 7,
            survey_habitat_feature_id: 1,
            itis_tsn: 6,
            itis_scientific_name: 'itis_scientific_name',
            comment: 'taxon comment'
          }
        ]
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

    const findSurveyHabitatFeaturesStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'findSurveyHabitatFeatures')
      .resolves(mockFindSurveyHabitatFeaturesResponse);

    const findSurveyHabitatFeaturesCountStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'findSurveyHabitatFeaturesCount')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.query = {
      keyword: 'keyword',
      itis_tsns: ['123456'],
      start_date: '2021-01-01',
      end_date: '2021-01-31',
      start_time: '00:00:00',
      end_time: '23:59:59',
      min_count: '5',
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

    const requestHandler = findSurveyHabitatFeatures();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findSurveyHabitatFeaturesStub).to.have.been.calledOnceWith(
        false,
        20,
        sinon.match.object,
        sinon.match.object
      );
      expect(findSurveyHabitatFeaturesCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
