import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { dbDependencies as db } from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { FlattenedObservationRecordWithSamplingAndSubcountData } from '../../../repositories/observation-repository/observation-repository.interface';
import { ObservationService } from '../../../services/observation-services/observation-service';
import { KeycloakUserInformation } from '../../../utils/keycloak-utils';
import { findFlattenedObservations } from './index';

chai.use(sinonChai);

describe('findFlattenedObservations', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns flattened observations', async () => {
    const mockFindFlattenedObservationsResponse: FlattenedObservationRecordWithSamplingAndSubcountData[] = [
      {
        survey_observation_id: 11,
        survey_id: 1,
        latitude: 3,
        longitude: 4,
        count: 5,
        itis_tsn: 6,
        itis_scientific_name: 'itis_scientific_name',
        observation_date: '2023-01-01',
        observation_time: '12:00:00',
        survey_sample_site_id: 7,
        survey_sample_site_name: 'SITE_NAME',
        method_technique_id: 8,
        method_technique_name: 'TECHNIQUE_NAME',
        survey_sample_period_id: 1,
        survey_sample_period_start_datetime: '2000-01-01 00:00:00',
        observation_sign_id: 1,
        qualitative_environments: [],
        quantitative_environments: [],
        subcount: {
          observation_subcount_id: 9,
          subcount: 5,
          comment: 'comment',
          qualitative_measurements: [],
          quantitative_measurements: []
        }
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const findFlattenedObservationsStub = sinon
      .stub(ObservationService.prototype, 'findFlattenedObservations')
      .resolves(mockFindFlattenedObservationsResponse);

    const findFlattenedObservationsCountStub = sinon
      .stub(ObservationService.prototype, 'findFlattenedObservationsCount')
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

    const requestHandler = findFlattenedObservations();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findFlattenedObservationsStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findFlattenedObservationsCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.jsonValue.surveyObservations).to.eql(mockFindFlattenedObservationsResponse);
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindFlattenedObservationsResponse: FlattenedObservationRecordWithSamplingAndSubcountData[] = [
      {
        survey_observation_id: 11,
        survey_id: 1,
        latitude: 3,
        longitude: 4,
        count: 5,
        itis_tsn: 6,
        itis_scientific_name: 'itis_scientific_name',
        observation_date: '2023-01-01',
        observation_time: '12:00:00',
        survey_sample_site_id: 7,
        survey_sample_site_name: 'SITE_NAME',
        method_technique_id: 8,
        method_technique_name: 'TECHNIQUE_NAME',
        survey_sample_period_id: 1,
        survey_sample_period_start_datetime: '2000-01-01 00:00:00',
        observation_sign_id: 1,
        qualitative_environments: [],
        quantitative_environments: [],
        subcount: {
          observation_subcount_id: 9,
          subcount: 5,
          comment: 'comment',
          qualitative_measurements: [],
          quantitative_measurements: []
        }
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

    const findFlattenedObservationsStub = sinon
      .stub(ObservationService.prototype, 'findFlattenedObservations')
      .resolves(mockFindFlattenedObservationsResponse);

    const findFlattenedObservationsCountStub = sinon
      .stub(ObservationService.prototype, 'findFlattenedObservationsCount')
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

    const requestHandler = findFlattenedObservations();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findFlattenedObservationsStub).to.have.been.calledOnceWith(
        false,
        20,
        sinon.match.object,
        sinon.match.object
      );
      expect(findFlattenedObservationsCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
