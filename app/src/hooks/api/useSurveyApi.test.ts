import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ICreateCritter } from 'features/surveys/view/survey-animals/animal';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IDetailedCritterWithInternalId,
  IFindSurveysResponse,
  SurveyBasicFieldsObject
} from 'interfaces/useSurveyApi.interface';
import { ApiPaginationResponseParams } from 'types/misc';
import { v4 } from 'uuid';
import useSurveyApi from './useSurveyApi';

describe('useSurveyApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;
  const surveyId = 1;
  const critterId = 1;
  const deploymentId = 1;

  describe('createSurvey', () => {
    it('creates a survey', async () => {
      const projectId = 1;
      const survey = {} as unknown as ICreateSurveyRequest;

      const res: ICreateSurveyResponse = {
        id: 1
      };

      mock.onPost(`/api/project/${projectId}/survey/create`).reply(200, res);

      const result = await useSurveyApi(axios).createSurvey(projectId, survey);

      expect(result.id).toEqual(1);
    });
  });

  describe('getSurveysBasicFieldsByProjectId', () => {
    it('fetches an array of surveys', async () => {
      const projectId = 1;

      const res: IFindSurveysResponse = {
        surveys: [{ survey_id: 1 }, { survey_id: 2 }] as SurveyBasicFieldsObject[],
        pagination: null as unknown as ApiPaginationResponseParams
      };

      mock.onGet(`/api/project/${projectId}/survey`).reply(200, res);

      const result = await useSurveyApi(axios).getSurveysBasicFieldsByProjectId(projectId);

      expect(result.surveys.length).toEqual(2);
      expect(result.surveys[0].survey_id).toEqual(1);
      expect(result.surveys[1].survey_id).toEqual(2);
    });
  });

  describe('createCritterAndAddToSurvey', () => {
    it('creates a critter successfully', async () => {
      const critter: ICreateCritter = {
        critter_id: 'blah-blah',
        itis_tsn: 1,
        wlh_id: '123-45',
        animal_id: 'carl',
        sex_qualitative_option_id: null,
        critter_comment: 'comment'
      };

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters`).reply(201, { create: { critters: 1 } });

      const result = await useSurveyApi(axios).createCritterAndAddToSurvey(projectId, surveyId, critter);

      expect(result).toBeDefined();
    });
  });

  describe('removeCrittersFromSurvey', () => {
    it('should remove a critter from survey', async () => {
      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters/delete`).reply(200, 1);

      const result = await useSurveyApi(axios).removeCrittersFromSurvey(projectId, surveyId, [critterId]);

      expect(result).toBe(1);
    });
  });

  describe('createDeployment', () => {
    it('should add deployment to survey critter', async () => {
      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`).reply(201, 1);

      const result = await useSurveyApi(axios).createDeployment(projectId, surveyId, critterId, {
        device_id: 1,
        device_make: 22,
        device_model: 'E',
        frequency: 1,
        frequency_unit: 33,
        critterbase_start_capture_id: '',
        critterbase_end_capture_id: '',
        critterbase_end_mortality_id: '',
        attachment_end_date: '',
        attachment_end_time: ''
      });

      expect(result).toBe(1);
    });
  });

  describe('getDeploymentsInSurvey', () => {
    it('should get one deployment', async () => {
      const response = {
        deployments: [
          {
            assignment_id: v4(),
            collar_id: v4(),
            critterbase_critter_id: v4(),
            critter_id: 123,
            critterbase_start_capture_id: '',
            critterbase_end_capture_id: '',
            critterbase_end_mortality_id: '',
            attachment_start_date: '',
            attachment_start_time: '',
            attachment_end_date: '',
            attachment_end_time: '',
            deployment_id: 123,
            bctw_deployment_id: v4(),
            device_id: 123,
            device_make: 22,
            device_model: 'a',
            frequency: 1,
            frequency_unit: 33
          }
        ],
        bad_deployments: []
      };

      mock.onGet(`/api/project/${projectId}/survey/${surveyId}/deployments`).reply(200, response);

      const result = await useSurveyApi(axios).getDeploymentsInSurvey(projectId, surveyId);

      expect(result.deployments.length).toBe(1);
      expect(result.deployments[0].device_id).toBe(123);
    });
  });

  describe('updateDeployment', () => {
    it('should update a deployment', async () => {
      mock.onPut(`/api/project/${projectId}/survey/${surveyId}/deployments/${deploymentId}`).reply(200, 1);
      const result = await useSurveyApi(axios).updateDeployment(projectId, surveyId, deploymentId, {
        critter_id: 1,
        critterbase_start_capture_id: '',
        critterbase_end_capture_id: '',
        critterbase_end_mortality_id: '',
        attachment_end_date: '',
        attachment_end_time: '',
        frequency: 10.5,
        frequency_unit: 44,
        device_id: 1,
        device_make: 22,
        device_model: ''
      });

      expect(result).toBe(1);
    });
  });

  describe('getSurveyCritters', () => {
    it('should get critters', async () => {
      const response = [
        {
          critterbase_critter_id: 'critter'
        } as IDetailedCritterWithInternalId
      ];

      mock.onGet(`/api/project/${projectId}/survey/${surveyId}/critters`).reply(200, response);

      const result = await useSurveyApi(axios).getSurveyCritters(projectId, surveyId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result).toEqual(response);
    });
  });

  describe('exportData', () => {
    it('should get critters', async () => {
      const mockResponse = { presignedS3Urls: ['signed-url-for:path/to/file/key'] };

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/export`).reply(200, mockResponse);

      const result = await useSurveyApi(axios).exportData(projectId, surveyId, {
        metadata: true,
        sampling_data: false,
        observation_data: true,
        telemetry_data: true,
        animal_data: false,
        artifacts: false
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
