import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { ObservationRecordWithSamplingAndSubcountData } from '../../repositories/observation-repository/observation-repository';
import { ObservationService } from '../../services/observation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { findObservations } from './index';

chai.use(sinonChai);

describe('findObservations', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('finds and returns observations', async () => {
    const mockFindObservationsResponse: ObservationRecordWithSamplingAndSubcountData[] = [
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
        survey_sample_method_name: 'METHOD_NAME',
        survey_sample_period_start_datetime: '2000-01-01 00:00:00',
        survey_sample_site_name: 'SITE_NAME',
        survey_sample_site_id: 1,
        survey_sample_method_id: 1,
        survey_sample_period_id: 1,
        subcounts: [
          {
            observation_subcount_id: 9,
            subcount: 5,
            qualitative_measurements: [],
            quantitative_measurements: [],
            qualitative_environments: [],
            quantitative_environments: []
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

    const findObservationsStub = sinon
      .stub(ObservationService.prototype, 'findObservations')
      .resolves(mockFindObservationsResponse);

    const findObservationsCountStub = sinon.stub(ObservationService.prototype, 'findObservationsCount').resolves(50);

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
    mockReq['keycloak_token'] = {};
    mockReq['system_user'] = {
      role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
    };

    const requestHandler = findObservations();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(findObservationsStub).to.have.been.calledOnceWith(true, 20, sinon.match.object, sinon.match.object);
    expect(findObservationsCountStub).to.have.been.calledOnceWith(true, 20, sinon.match.object);

    expect(mockRes.jsonValue.surveyObservations).to.eql(mockFindObservationsResponse);
    expect(mockRes.jsonValue.supplementaryObservationData).to.eql({
      observationCount: 50,
      qualitative_measurements: [],
      quantitative_measurements: [],
      qualitative_environments: [],
      quantitative_environments: []
    });
    expect(mockRes.jsonValue.pagination).not.to.be.null;

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockFindObservationsResponse: ObservationRecordWithSamplingAndSubcountData[] = [
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
        survey_sample_method_name: 'METHOD_NAME',
        survey_sample_period_start_datetime: '2000-01-01 00:00:00',
        survey_sample_site_name: 'SITE_NAME',
        survey_sample_site_id: 1,
        survey_sample_method_id: 1,
        survey_sample_period_id: 1,
        subcounts: [
          {
            observation_subcount_id: 9,
            subcount: 5,
            qualitative_measurements: [],
            quantitative_measurements: [],
            qualitative_environments: [],
            quantitative_environments: []
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

    const findObservationsStub = sinon
      .stub(ObservationService.prototype, 'findObservations')
      .resolves(mockFindObservationsResponse);

    const findObservationsCountStub = sinon
      .stub(ObservationService.prototype, 'findObservationsCount')
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
    mockReq['keycloak_token'] = {};
    mockReq['system_user'] = {
      role_names: [SYSTEM_ROLE.PROJECT_CREATOR]
    };

    const requestHandler = findObservations();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(findObservationsStub).to.have.been.calledOnceWith(false, 20, sinon.match.object, sinon.match.object);
      expect(findObservationsCountStub).to.have.been.calledOnceWith(false, 20, sinon.match.object);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
