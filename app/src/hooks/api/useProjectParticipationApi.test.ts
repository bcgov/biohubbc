import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useProjectParticipationApi from './useProjectParticipationApi';

describe('useProjectParticipationApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;

  it('getProjectParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/project/${projectId}/participants`).reply(200, mockResponse);

    const result = await useProjectParticipationApi(axios).getProjectParticipants(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('getUserProjectParticipant works as expected', async () => {
    const mockResponse = {
      participant: {
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['RoleA'],
        project_role_permissions: ['PermissionA']
      }
    };
    mock.onGet(`/api/project/${projectId}/participants/self`).reply(200, mockResponse);

    const result = await useProjectParticipationApi(axios).getUserProjectParticipant(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('addProjectParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/project/${projectId}/participants`).reply(200, mockResponse);

    const result = await useProjectParticipationApi(axios).getProjectParticipants(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('removeProjectParticipant works as expected', async () => {
    const projectParticipationId = 1;

    mock.onDelete(`/api/project/${projectId}/participants/${projectParticipationId}`).reply(200);

    const result = await useProjectParticipationApi(axios).removeProjectParticipant(projectId, projectParticipationId);

    expect(result).toEqual(true);
  });

  it('updateProjectParticipantRole works as expected', async () => {
    const projectParticipationId = 1;
    const projectRoleId = 1;

    mock.onPut(`/api/project/${projectId}/participants/${projectParticipationId}`).reply(200);

    const result = await useProjectParticipationApi(axios).updateProjectParticipantRole(
      projectId,
      projectParticipationId,
      projectRoleId
    );

    expect(result).toEqual(true);
  });
});
