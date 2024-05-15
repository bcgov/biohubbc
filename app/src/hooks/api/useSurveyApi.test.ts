import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AnimalSex, ICreateCritter } from 'features/surveys/view/survey-animals/animal';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IDetailedCritterWithInternalId,
  IGetSurveyListResponse,
  SurveyBasicFieldsObject
} from 'interfaces/useSurveyApi.interface';
import { ApiPaginationResponseParams } from 'types/misc';
import { v4 } from 'uuid';
import useSurveyApi from './useSurveyApi';

describe('useSurveyApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;
  const surveyId = 1;
  const critterId = 1;

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

      const res: IGetSurveyListResponse = {
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
        itis_tsn: 1,
        critter_id: 'blah-blah',
        wlh_id: '123-45',
        animal_id: 'carl',
        sex: AnimalSex.MALE
      };

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters`).reply(201, { create: { critters: 1 } });

      const result = await useSurveyApi(axios).createCritterAndAddToSurvey(projectId, surveyId, critter);

      expect(result).toBeDefined();
    });
  });

  describe('removeCritterFromSurvey', () => {
    it('should remove a critter from survey', async () => {
      mock.onDelete(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}`).reply(200, 1);

      const result = await useSurveyApi(axios).removeCrittersFromSurvey(projectId, surveyId, [critterId]);

      expect(result).toBe(1);
    });
  });

  describe('addDeployment', () => {
    it('should add deployment to survey critter', async () => {
      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`).reply(201, 1);

      const result = await useSurveyApi(axios).addDeployment(projectId, surveyId, critterId, {
        device_id: 1,
        device_make: 'ATS',
        device_model: 'E',
        frequency: 1,
        frequency_unit: 'Hz',
        deployments: [
          {
            deployment_id: '',
            attachment_start: '2023-01-01',
            attachment_end: undefined
          }
        ],
        critter_id: v4()
      });

      expect(result).toBe(1);
    });

    it('should fail to add deployment to survey critter', async () => {
      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`).reply(201, 1);

      const result = useSurveyApi(axios).addDeployment(projectId, surveyId, critterId, {
        device_id: 1,
        device_make: 'ATS',
        device_model: 'E',
        frequency: 1,
        frequency_unit: 'Hz',
        deployments: [
          {
            deployment_id: '',
            attachment_start: '2023-01-01',
            attachment_end: undefined
          },
          {
            deployment_id: '',
            attachment_start: '2023-01-01',
            attachment_end: undefined
          }
        ],
        critter_id: v4()
      });

      await expect(result).rejects.toThrow();
    });
  });

  describe('getDeploymentsInSurvey', () => {
    it('should get one deployment', async () => {
      const response: IAnimalDeployment = {
        assignment_id: v4(),
        collar_id: v4(),
        critter_id: v4(),
        attachment_start: '2023-01-01',
        attachment_end: '2023-01-01',
        deployment_id: v4(),
        device_id: 123,
        device_make: '',
        device_model: 'a',
        frequency: 1,
        frequency_unit: 'Hz'
      };

      mock.onGet(`/api/project/${projectId}/survey/${surveyId}/deployments`).reply(200, [response]);

      const result = await useSurveyApi(axios).getDeploymentsInSurvey(projectId, surveyId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].device_id).toBe(123);
    });
  });

  describe('updateDeployment', () => {
    it('should update a deployment', async () => {
      mock.onPatch(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`).reply(200, 1);
      const result = await useSurveyApi(axios).updateDeployment(projectId, surveyId, critterId, {
        attachment_end: undefined,
        deployment_id: 'a',
        attachment_start: 'a'
      });

      expect(result).toBe(1);
    });
  });

  describe('getSurveyCritters', () => {
    it('should get critters', async () => {
      const response = [
        {
          critter_id: 'critter'
        } as IDetailedCritterWithInternalId
      ];

      mock.onGet(`/api/project/${projectId}/survey/${surveyId}/critters`).reply(200, response);

      const result = await useSurveyApi(axios).getSurveyCritters(projectId, surveyId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result).toEqual(response);
    });
  });

  describe('uploadSurveyKeyx', () => {
    it('should upload a keyx file', async () => {
      const file = new File([''], 'file.keyx', { type: 'application/keyx' });
      const response = {
        attachmentId: 'attachment',
        revision_count: 1
      };
      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/attachments/keyx/upload`).reply(201, response);

      const result = await useSurveyApi(axios).uploadSurveyKeyx(projectId, surveyId, file);
      expect(result).toEqual(response);
    });
  });
});
