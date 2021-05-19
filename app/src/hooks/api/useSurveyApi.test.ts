import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ICreateSurveyRequest } from 'interfaces/useSurveyApi.interface';
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

  it('createSurvey works as expected', async () => {
    mock.onPost(`api/project/${projectId}/survey/create`).reply(200, {
      id: 1
    });

    const result = await useSurveyApi(axios).createSurvey(projectId, {
      survey_name: 'survey name'
    } as ICreateSurveyRequest);

    expect(result).toEqual({ id: 1 });
  });
});
