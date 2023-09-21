import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AnimalSex, Critter, IAnimal } from 'features/surveys/view/survey-animals/animal';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/device';
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

  describe('createCritterAndAddToSurvey', () => {
    it('creates a critter successfully', async () => {
      const animal: IAnimal = {
        general: { animal_id: '1', taxon_id: v4(), taxon_name: '1', wlh_id: 'a', sex: AnimalSex.UNKNOWN },
        captures: [],
        markings: [],
        measurements: [],
        mortality: [],
        family: [],
        images: [],
        device: undefined,
        collectionUnits: []
      };
      const critter = new Critter(animal);

      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters`).reply(201, { create: { critters: 1 } });

      const result = await useSurveyApi(axios).createCritterAndAddToSurvey(projectId, surveyId, critter);

      expect(result.create.critters).toBe(1);
    });
  });

  describe('removeCritterFromSurvey', () => {
    it('should remove a critter from survey', async () => {
      mock.onDelete(`/api/project/${projectId}/survey/${surveyId}/critters/${critterId}`).reply(200, 1);

      const result = await useSurveyApi(axios).removeCritterFromSurvey(projectId, surveyId, critterId);

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
});
