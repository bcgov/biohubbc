import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useSurveyParticipationApi from './useSurveyParticipationApi';

describe('useSurveyParticipationApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const surveyId = 1;

  it('getSurveyParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/survey/${surveyId}/participants`).reply(200, mockResponse);

    const result = await useSurveyParticipationApi(axios).getSurveyParticipants(surveyId);

    expect(result).toEqual(mockResponse);
  });

  it('getUserSurveyParticipant works as expected', async () => {
    const mockResponse = {
      participant: {
        survey_id: 1,
        system_user_id: 1,
        survey_role_ids: [1],
        survey_role_names: ['RoleA'],
        survey_role_permissions: ['PermissionA']
      }
    };
    mock.onGet(`/api/survey/${surveyId}/participants/self`).reply(200, mockResponse);

    const result = await useSurveyParticipationApi(axios).getUserSurveyParticipant(surveyId);

    expect(result).toEqual(mockResponse);
  });

  it('addSurveyParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/survey/${surveyId}/participants`).reply(200, mockResponse);

    const result = await useSurveyParticipationApi(axios).getSurveyParticipants(surveyId);

    expect(result).toEqual(mockResponse);
  });

  it('removeSurveyParticipant works as expected', async () => {
    const surveyParticipationId = 1;

    mock.onDelete(`/api/survey/${surveyId}/participants/${surveyParticipationId}`).reply(200);

    const result = await useSurveyParticipationApi(axios).removeSurveyParticipant(surveyId, surveyParticipationId);

    expect(result).toEqual(true);
  });

  it('updateSurveyParticipantRole works as expected', async () => {
    const surveyParticipationId = 1;
    const surveyRoleId = 1;

    mock.onPut(`/api/survey/${surveyId}/participants/${surveyParticipationId}`).reply(200);

    const result = await useSurveyParticipationApi(axios).updateSurveyParticipantRole(
      surveyId,
      surveyParticipationId,
      surveyRoleId
    );

    expect(result).toEqual(true);
  });
});
