import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ICreateSurveyRequest, UPDATE_GET_SURVEY_ENTITIES } from 'interfaces/useSurveyApi.interface';
import { getSurveyForViewResponse } from 'test-helpers/survey-helpers';
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
  const attachmentId = 3;

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
    mock.onDelete(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/delete`).reply(200, 1);

    const result = await useSurveyApi(axios).deleteSurveyAttachment(projectId, surveyId, attachmentId);

    expect(result).toEqual(1);
  });

  it('getSurveyForView works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/survey/${surveyId}/view`).reply(200, getSurveyForViewResponse);

    const result = await useSurveyApi(axios).getSurveyForView(projectId, surveyId);

    expect(result.survey_details.id).toEqual(1);
    expect(result.survey_details.survey_name).toEqual('survey name');
  });

  it('getSurveysList works as expected', async () => {
    const res = [
      {
        id: 1,
        name: 'name',
        species: ['species 1', 'species 2'],
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        publish_status: 'Published',
        completion_status: 'Completed'
      }
    ];

    mock.onGet(`/api/project/${projectId}/surveys`).reply(200, res);

    const result = await useSurveyApi(axios).getSurveysList(projectId);

    expect(result[0].id).toEqual(1);
  });

  it('getSurveyAttachmentSignedURL works as expected', async () => {
    const signedUrl = 'url.com';

    mock
      .onGet(`/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/getSignedUrl`)
      .reply(200, signedUrl);

    const result = await useSurveyApi(axios).getSurveyAttachmentSignedURL(projectId, surveyId, attachmentId);

    expect(result).toEqual(signedUrl);
  });

  it('uploadTemplateObservations works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/template/upload`).reply(200, 'OK');

    const result = await useSurveyApi(axios).uploadTemplateObservations(projectId, surveyId, file);

    expect(result).toEqual('OK');
  });

  it('getSurveyAttachments works as expected', async () => {
    const res = {
      attachmentsList: [
        {
          id: 1,
          fileName: 'name',
          lastModified: '2020/05/05',
          size: 3028
        }
      ]
    };

    mock.onGet(`/api/project/${projectId}/survey/${surveyId}/attachments/list`).reply(200, res);

    const result = await useSurveyApi(axios).getSurveyAttachments(projectId, surveyId);

    expect(result.attachmentsList[0].id).toEqual(1);
  });

  it('uploadSurveyAttachments works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/survey/${surveyId}/attachments/upload`).reply(200, ['result 1', 'result 2']);

    const result = await useSurveyApi(axios).uploadSurveyAttachments(projectId, surveyId, [file]);

    expect(result).toEqual(['result 1', 'result 2']);
  });

  it('updateSurvey works as expected', async () => {
    const request = {
      survey_details: {
        id: 1,
        survey_name: 'name',
        survey_purpose: 'purpose',
        focal_species: [1, 2],
        ancillary_species: [1, 2],
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        geometry: [],
        revision_count: 1,
        permit_number: '123',
        permit_type: 'Scientific'
      },
      survey_proprietor: null
    };

    mock.onPut(`api/project/${projectId}/survey/${surveyId}/update`).reply(200, true);

    const result = await useSurveyApi(axios).updateSurvey(projectId, surveyId, request as any);

    expect(result).toEqual(true);
  });

  it('getSurveyForUpdate works as expected', async () => {
    const data = {
      survey_details: {
        id: 1,
        survey_name: 'name',
        survey_purpose: 'purpose',
        focal_species: [1, 2],
        ancillary_species: [1, 2],
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'area name',
        geometry: [],
        revision_count: 1
      },
      survey_proprietor: null
    };

    mock.onGet(`api/project/${projectId}/survey/${surveyId}/update`).reply(200, data);

    const result = await useSurveyApi(axios).getSurveyForUpdate(projectId, surveyId, [
      UPDATE_GET_SURVEY_ENTITIES.survey_details
    ]);

    expect(result).toEqual(data);
  });

  it('publishSurvey works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/survey/${surveyId}/publish`).reply(200, 'OK');

    const result = await useSurveyApi(axios).publishSurvey(projectId, surveyId, true);

    expect(result).toEqual('OK');
  });
});
