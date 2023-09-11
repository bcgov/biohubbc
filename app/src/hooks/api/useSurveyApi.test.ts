import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Critter, IAnimal } from 'features/surveys/view/survey-animals/animal';
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

  describe('createCritterAndAddToSurvey', () => {
    it('creates a critter successfully', async () => {
      const animal: IAnimal = {
        general: { animal_id: '1', taxon_id: v4(), taxon_name: '1' },
        captures: [],
        markings: [],
        measurements: [],
        mortality: [],
        family: [],
        images: [],
        device: undefined
      };
      const critter = new Critter(animal);
      const projectId = 1;
      const surveyId = 1;
      mock.onPost(`/api/project/${projectId}/survey/${surveyId}/critters`).reply(201, { create: { critters: 1 } });

      const result = await useSurveyApi(axios).createCritterAndAddToSurvey(projectId, surveyId, critter);

      expect(result.create.critters).toBe(1);
    });
  });
});
