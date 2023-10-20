import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertObservation,
  ObservationRecord,
  ObservationRepository,
  UpdateObservation
} from '../repositories/observation-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { ObservationService } from './observation-service';

chai.use(sinonChai);

describe('ObservationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('constructs', () => {
    const mockDBConnection = getMockDBConnection();

    const observationService = new ObservationService(mockDBConnection);

    expect(observationService).to.be.instanceof(ObservationService);
  });

  describe('insertUpdateDeleteSurveyObservations', () => {
    it('deletes, creates, and updates observation records', async () => {
      const mockDBConnection = getMockDBConnection();

      const deleteObservationsNotInArrayStub = sinon
        .stub(ObservationRepository.prototype, 'deleteObservationsNotInArray')
        .resolves();

      const mockInsertUpdateResponse: ObservationRecord[] = [
        {
          survey_observation_id: 11,
          survey_id: 1,
          wldtaxonomic_units_id: 2,
          latitude: 3,
          longitude: 4,
          count: 5,
          observation_date: '2023-01-01',
          observation_time: '12:00:00',
          create_date: '2023-04-04',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0,
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1
        },
        {
          survey_observation_id: 6,
          survey_id: 1,
          wldtaxonomic_units_id: 7,
          latitude: 8,
          longitude: 9,
          count: 10,
          observation_date: '2023-02-02',
          observation_time: '13:00:00',
          create_date: '2023-03-03',
          create_user: 1,
          update_date: '2023-04-04',
          update_user: 2,
          revision_count: 1,
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1
        }
      ];
      const insertUpdateSurveyObservationsStub = sinon
        .stub(ObservationRepository.prototype, 'insertUpdateSurveyObservations')
        .resolves(mockInsertUpdateResponse);

      const surveyId = 1;
      const observations: (InsertObservation | UpdateObservation)[] = [
        {
          survey_id: 1,
          wldtaxonomic_units_id: 2,
          latitude: 3,
          longitude: 4,
          count: 5,
          observation_date: '2023-01-01',
          observation_time: '12:00:00'
        } as InsertObservation,
        {
          survey_observation_id: 6,
          wldtaxonomic_units_id: 7,
          latitude: 8,
          longitude: 9,
          count: 10,
          observation_date: '2023-02-02',
          observation_time: '13:00:00'
        } as UpdateObservation
      ];

      const observationService = new ObservationService(mockDBConnection);

      const response = await observationService.insertUpdateDeleteSurveyObservations(surveyId, observations);

      expect(deleteObservationsNotInArrayStub).to.have.been.calledOnceWith(surveyId, [6]);
      expect(insertUpdateSurveyObservationsStub).to.have.been.calledOnceWith(surveyId, observations);
      expect(response).to.eql(mockInsertUpdateResponse);
    });
  });

  describe('getSurveyObservations', () => {
    it('Gets observations by survey id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockGetResponse: ObservationRecord[] = [
        {
          survey_observation_id: 11,
          survey_id: 1,
          wldtaxonomic_units_id: 2,
          latitude: 3,
          longitude: 4,
          count: 5,
          observation_date: '2023-01-01',
          observation_time: '12:00:00',
          create_date: '2023-04-04',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0,
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1
        },
        {
          survey_observation_id: 6,
          survey_id: 1,
          wldtaxonomic_units_id: 7,
          latitude: 8,
          longitude: 9,
          count: 10,
          observation_date: '2023-02-02',
          observation_time: '13:00:00',
          create_date: '2023-03-03',
          create_user: 1,
          update_date: '2023-04-04',
          update_user: 2,
          revision_count: 1,
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1
        }
      ];
      const getSurveyObservationsStub = sinon
        .stub(ObservationRepository.prototype, 'getSurveyObservations')
        .resolves(mockGetResponse);

      const surveyId = 1;

      const observationService = new ObservationService(mockDBConnection);

      const response = await observationService.getSurveyObservations(surveyId);

      expect(getSurveyObservationsStub).to.be.calledOnceWith(surveyId);
      expect(response).to.eql(mockGetResponse);
    });
  });
});
