import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  InsertObservation,
  ObservationRecord,
  ObservationRecordWithSamplingDataWithAttributes,
  ObservationRepository,
  UpdateObservation
} from '../repositories/observation-repository';
import * as file_utils from '../utils/file-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { CritterbaseService } from './critterbase-service';
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
          latitude: 3,
          longitude: 4,
          count: 5,
          itis_tsn: 6,
          itis_scientific_name: 'itis_scientific_name',
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
          latitude: 8,
          longitude: 9,
          count: 10,
          itis_tsn: 6,
          itis_scientific_name: 'itis_scientific_name',
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
          latitude: 3,
          longitude: 4,
          count: 5,
          itis_tsn: 6,
          itis_scientific_name: 'itis_scientific_name',
          observation_date: '2023-01-01',
          observation_time: '12:00:00'
        } as InsertObservation,
        {
          survey_observation_id: 6,
          latitude: 8,
          longitude: 9,
          count: 10,
          itis_tsn: 6,
          itis_scientific_name: 'itis_scientific_name',
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

  describe('getSurveyObservationsWithSupplementaryAndSamplingData', () => {
    it('Gets observations by survey id', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockObservations: ObservationRecordWithSamplingDataWithAttributes[] = [
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
          create_date: '2023-04-04',
          create_user: 1,
          update_date: null,
          update_user: null,
          revision_count: 0,
          survey_sample_method_name: 'METHOD_NAME',
          survey_sample_period_start_datetime: '2000-01-01 00:00:00',
          survey_sample_site_name: 'SITE_NAME',
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1,
          subcount: 5,
          observation_subcount_attributes: []
        },
        {
          survey_observation_id: 6,
          survey_id: 1,
          latitude: 8,
          longitude: 9,
          count: 10,
          itis_tsn: 6,
          itis_scientific_name: 'itis_scientific_name',
          observation_date: '2023-02-02',
          observation_time: '13:00:00',
          create_date: '2023-03-03',
          create_user: 1,
          update_date: '2023-04-04',
          update_user: 2,
          revision_count: 1,
          survey_sample_method_name: 'METHOD_NAME',
          survey_sample_period_start_datetime: '2000-01-01 00:00:00',
          survey_sample_site_name: 'SITE_NAME',
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1,
          subcount: 10,
          observation_subcount_attributes: []
        }
      ];

      const mockSupplementaryData = {
        observationCount: 1,
        measurementColumns: []
      };

      const getSurveyObservationsStub = sinon
        .stub(ObservationRepository.prototype, 'getSurveyObservationsWithSamplingDataWithAttributesData')
        .resolves(mockObservations);

      const getMeasurementValuesForEventIdsStub = sinon
        .stub(CritterbaseService.prototype, 'getMeasurementValuesForEventIds')
        .resolves([]);

      const getSurveyObservationSupplementaryDataStub = sinon
        .stub(ObservationService.prototype, 'getSurveyObservationsSupplementaryData')
        .resolves(mockSupplementaryData);

      const surveyId = 1;

      const observationService = new ObservationService(mockDBConnection);

      const response = await observationService.getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData(
        surveyId
      );

      expect(getSurveyObservationsStub).to.be.calledOnceWith(surveyId);
      expect(getMeasurementValuesForEventIdsStub).to.be.calledOnceWith([]);
      expect(getSurveyObservationSupplementaryDataStub).to.be.calledOnceWith(surveyId);
      expect(response).to.eql({
        surveyObservations: [
          {
            ...mockObservations[0],
            observation_subcount_attributes: []
          },
          {
            ...mockObservations[1],
            observation_subcount_attributes: []
          }
        ],
        supplementaryObservationData: mockSupplementaryData
      });
    });
  });

  describe('insertSurveyObservationSubmission', () => {
    it('Inserts a survey observation submission record into the database', async () => {
      const mockDBConnection = getMockDBConnection();
      const submission_id = 1;
      const key = 'key';
      const survey_id = 1;
      const original_filename = 'originalFilename';
      const mockFile = { originalname: original_filename } as Express.Multer.File;
      const projectId = 1;

      const mockInsertResponse = {
        submission_id,
        key,
        survey_id,
        original_filename,
        create_date: '2023-04-04',
        create_user: 1,
        update_date: null,
        update_user: null
      };
      const getNextSubmissionIdStub = sinon
        .stub(ObservationRepository.prototype, 'getNextSubmissionId')
        .resolves(submission_id);
      const generateS3FileKeyStub = sinon.stub(file_utils, 'generateS3FileKey').returns(key);
      const insertSurveyObservationSubmissionStub = sinon
        .stub(ObservationRepository.prototype, 'insertSurveyObservationSubmission')
        .resolves(mockInsertResponse);

      const observationService = new ObservationService(mockDBConnection);

      const response = await observationService.insertSurveyObservationSubmission(mockFile, projectId, survey_id);

      expect(getNextSubmissionIdStub).to.be.calledOnce;
      expect(generateS3FileKeyStub).to.be.calledOnce;
      expect(insertSurveyObservationSubmissionStub).to.be.calledOnceWith(
        submission_id,
        key,
        survey_id,
        original_filename
      );
      expect(response).to.eql({
        submission_id,
        key
      });
    });
  });

  describe('getObservationsCountBySampleSiteIds', () => {
    it('Gets the number of observations by sample site ids', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockObservationCount = {
        observationCount: 1
      };

      const getObservationsCountBySampleSiteIdsStub = sinon
        .stub(ObservationRepository.prototype, 'getObservationsCountBySampleSiteIds')
        .resolves(mockObservationCount);

      const surveyId = 1;
      const surveySampleSiteIds = [1];

      const observationService = new ObservationService(mockDBConnection);

      const response = await observationService.getObservationsCountBySampleSiteIds(surveyId, surveySampleSiteIds);

      expect(getObservationsCountBySampleSiteIdsStub).to.be.calledOnceWith(surveyId, surveySampleSiteIds);
      expect(response).to.eql(mockObservationCount);
    });
  });
});
