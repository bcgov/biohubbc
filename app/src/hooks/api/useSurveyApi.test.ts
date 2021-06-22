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
  const surveyId = 2;

  it('createSurvey works as expected', async () => {
    mock.onPost(`api/project/${projectId}/survey/create`).reply(200, {
      id: 1
    });

    const result = await useSurveyApi(axios).createSurvey(projectId, {
      survey_name: 'survey name'
    } as ICreateSurveyRequest);

    expect(result).toEqual({ id: 1 });
  });

  it('deleteSurvey works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/survey/${surveyId}/delete`).reply(200, true);

    const result = await useSurveyApi(axios).deleteSurvey(projectId, surveyId);

    expect(result).toEqual(true);
  });

  it('deleteSurveyAttachment works as expected', async () => {
    const attachmentId = 3;

    mock.onDelete(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/delete`).reply(200, 1);

    const result = await useSurveyApi(axios).deleteSurveyAttachment(projectId, surveyId, attachmentId);

    expect(result).toEqual(1);
  });
});
