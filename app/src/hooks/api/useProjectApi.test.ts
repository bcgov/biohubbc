import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectPartnershipsForm } from 'features/projects/components/ProjectPartnershipsForm';
import { ICreateProjectRequest, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { ISurveyPermitForm } from '../../features/surveys/SurveyPermitForm';
import useProjectApi from './useProjectApi';

describe('useProjectApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const userId = 123;
  const projectId = 1;
  const attachmentId = 1;
  const attachmentType = 'type';

  const attachmentMetaForUpdate: IEditReportMetaForm = {
    title: 'upload file',
    authors: [{ first_name: 'John', last_name: 'Smith' }],
    description: 'file abstract',
    year_published: 2000,
    revision_count: 1
  };

  it('getAllUserProjectsForView works as expected', async () => {
    mock.onGet(`/api/user/${userId}/projects/get`).reply(200, [
      {
        project_id: 321,
        name: 'test',
        system_user_id: 1,
        project_role_id: 2,
        project_participation_id: 3
      }
    ]);

    const result = await useProjectApi(axios).getAllUserProjectsForView(123);

    expect(result[0]).toEqual({
      project_id: 321,
      name: 'test',
      system_user_id: 1,
      project_role_id: 2,
      project_participation_id: 3
    });
  });

  it('getProjectAttachments works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/attachments/list`).reply(200, {
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 3028
        }
      ]
    });

    const result = await useProjectApi(axios).getProjectAttachments(projectId);

    expect(result.attachmentsList).toEqual([
      {
        id: 1,
        fileName: 'filename',
        lastModified: '2020/04/04',
        size: 3028
      }
    ]);
  });

  it('deleteProject works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/delete`).reply(200, true);

    const result = await useProjectApi(axios).deleteProject(projectId);

    expect(result).toEqual(true);
  });

  it('deleteProjectAttachment works as expected', async () => {
    mock.onPost(`/api/project/${projectId}/attachments/${attachmentId}/delete`).reply(200, 1);

    const result = await useProjectApi(axios).deleteProjectAttachment(projectId, attachmentId, attachmentType);

    expect(result).toEqual(1);
  });

  it('getProjectsList works as expected', async () => {
    const response = [
      {
        id: 1,
        name: 'project name',
        objectives: 'objectives',
        location_description: 'location',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        comments: 'comment',
        coordinator_first_name: 'first',
        coordinator_last_name: 'last',
        coordinator_email_address: 'email@example.com',
        coordinator_agency_name: 'agency',
        focal_species_name_list: 'focal'
      }
    ];

    mock.onGet(`/api/project/list`).reply(200, response);

    const result = await useProjectApi(axios).getProjectsList();

    expect(result).toEqual(response);
  });

  it('getProjectForView works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/view`).reply(200, getProjectForViewResponse);

    const result = await useProjectApi(axios).getProjectForView(projectId);

    expect(result).toEqual(getProjectForViewResponse);
  });

  it('getProjectForUpdate works as expected', async () => {
    mock.onGet(`api/project/${projectId}/update`).reply(200, {
      objectives: {
        objectives: 'objectives',
        revision_count: 1
      }
    });

    const result = await useProjectApi(axios).getProjectForUpdate(projectId, [UPDATE_GET_ENTITIES.objectives]);

    expect(result.objectives).toEqual({
      objectives: 'objectives',
      revision_count: 1
    });
  });

  it('updateProject works as expected', async () => {
    mock.onPut(`api/project/${projectId}/update`).reply(200, true);

    const result = await useProjectApi(axios).updateProject(projectId, {
      objectives: {
        objectives: 'objectives',
        revision_count: 1
      }
    });

    expect(result).toEqual(true);
  });

  it('uploadProjectAttachments works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/attachments/upload`).reply(200, 'result 1');

    const result = await useProjectApi(axios).uploadProjectAttachments(projectId, file);

    expect(result).toEqual('result 1');
  });

  it('createProject works as expected', async () => {
    const projectData = {
      coordinator: null as unknown as IProjectCoordinatorForm,
      permit: null as unknown as ISurveyPermitForm,
      project: null as unknown as IProjectDetailsForm,
      objectives: null as unknown as IProjectObjectivesForm,
      location: null as unknown as IProjectLocationForm,
      iucn: null as unknown as IProjectIUCNForm,
      partnerships: null as unknown as IProjectPartnershipsForm
    } as unknown as ICreateProjectRequest;

    mock.onPost('/api/project/create').reply(200, {
      id: 1
    });

    const result = await useProjectApi(axios).createProject(projectData);

    expect(result).toEqual({ id: 1 });
  });

  it('getAttachmentSignedURL works as expected for authenticated access', async () => {
    mock
      .onGet(`/api/project/${projectId}/attachments/${attachmentId}/getSignedUrl`, {
        query: { attachmentType: 'Other' }
      })
      .reply(200, 'www.signedurl.com');

    const result = await useProjectApi(axios).getAttachmentSignedURL(projectId, attachmentId, 'Other');

    expect(result).toEqual('www.signedurl.com');
  });

  it('updateProjectAttachmentMetadata works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/attachments/${attachmentId}/metadata/update`).reply(200, 'result 1');

    const result = await useProjectApi(axios).updateProjectReportMetadata(
      projectId,
      attachmentId,
      attachmentType,
      attachmentMetaForUpdate,
      attachmentMetaForUpdate.revision_count
    );

    expect(result).toEqual('result 1');
  });

  it('getProjectReportMetadata works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/attachments/${attachmentId}/metadata/get`).reply(200, 'result 1');

    const result = await useProjectApi(axios).getProjectReportDetails(projectId, attachmentId);

    expect(result).toEqual('result 1');
  });

  it('getProjectParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/project/${projectId}/participants/get`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getProjectParticipants(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('getUserProjectParticipant works as expected', async () => {
    const mockResponse = {
      participant: {
        project_id: 1,
        system_user_id: 1,
        project_role_ids: [1],
        project_role_names: ['RoleA']
      }
    };
    mock.onGet(`/api/project/${projectId}/participants/self`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getUserProjectParticipant(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('addProjectParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/project/${projectId}/participants/get`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getProjectParticipants(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('removeProjectParticipant works as expected', async () => {
    const projectParticipationId = 1;

    mock.onDelete(`/api/project/${projectId}/participants/${projectParticipationId}/delete`).reply(200);

    const result = await useProjectApi(axios).removeProjectParticipant(projectId, projectParticipationId);

    expect(result).toEqual(true);
  });

  it('removeProjectParticipant works as expected', async () => {
    const projectParticipationId = 1;
    const projectRoleId = 1;

    mock.onPut(`/api/project/${projectId}/participants/${projectParticipationId}/update`).reply(200);

    const result = await useProjectApi(axios).updateProjectParticipantRole(
      projectId,
      projectParticipationId,
      projectRoleId
    );

    expect(result).toEqual(true);
  });
});
