import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectFundingForm } from 'features/projects/components/ProjectFundingForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectPartnershipsForm } from 'features/projects/components/ProjectPartnershipsForm';
import { IProjectPermitForm } from 'features/projects/components/ProjectPermitForm';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import useProjectApi, { usePublicProjectApi } from './useProjectApi';

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
  const attachmentMeta: IReportMetaForm = {
    title: 'upload file',
    authors: [{ first_name: 'John', last_name: 'Smith' }],
    description: 'file abstract',
    year_published: 2000,
    attachmentFile: new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    })
  };

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

    const result = await useProjectApi(axios).deleteProjectAttachment(projectId, attachmentId, attachmentType, 'token');

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
        caveats: 'caveat',
        comments: 'comment',
        coordinator_first_name: 'first',
        coordinator_last_name: 'last',
        coordinator_email_address: 'email@example.com',
        coordinator_agency_name: 'agency',
        focal_species_name_list: 'focal'
      }
    ];

    mock.onPost(`/api/projects`).reply(200, response);

    const result = await useProjectApi(axios).getProjectsList();

    expect(result).toEqual(response);
  });

  it('getProjectsList works as expected (public)', async () => {
    const response = [
      {
        id: 1,
        name: 'project name',
        objectives: 'objectives',
        location_description: 'location',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        caveats: 'caveat',
        comments: 'comment',
        coordinator_first_name: 'first',
        coordinator_last_name: 'last',
        coordinator_email_address: 'email@example.com',
        coordinator_agency_name: 'agency',
        focal_species_name_list: 'focal'
      }
    ];

    mock.onGet(`/api/public/projects`).reply(200, response);

    const result = await usePublicProjectApi(axios).getProjectsList();

    expect(result).toEqual(response);
  });

  it('getProjectForView works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/view`).reply(200, getProjectForViewResponse);

    const result = await useProjectApi(axios).getProjectForView(projectId);

    expect(result).toEqual(getProjectForViewResponse);
  });

  it('getProjectForView works as expected (public)', async () => {
    mock.onGet(`/api/public/project/${projectId}/view`).reply(200, getProjectForViewResponse);

    const result = await usePublicProjectApi(axios).getProjectForView(projectId);

    expect(result).toEqual(getProjectForViewResponse);
  });

  it('getProjectForUpdate works as expected', async () => {
    mock.onGet(`api/project/${projectId}/update`).reply(200, {
      objectives: {
        objectives: 'objectives',
        caveats: 'caveats',
        revision_count: 1
      }
    });

    const result = await useProjectApi(axios).getProjectForUpdate(projectId, [UPDATE_GET_ENTITIES.objectives]);

    expect(result.objectives).toEqual({
      objectives: 'objectives',
      caveats: 'caveats',
      revision_count: 1
    });
  });

  it('updateProject works as expected', async () => {
    mock.onPut(`api/project/${projectId}/update`).reply(200, true);

    const result = await useProjectApi(axios).updateProject(projectId, {
      objectives: {
        objectives: 'objectives',
        caveats: 'caveats',
        revision_count: 1
      }
    });

    expect(result).toEqual(true);
  });

  it('addFundingSource works as expected', async () => {
    mock.onPost(`/api/project/${projectId}/funding-sources/add`).reply(200, {
      id: 1
    });

    const result = await useProjectApi(axios).addFundingSource(projectId, {
      funding_source_name: 'funding source name'
    });

    expect(result).toEqual({ id: 1 });
  });

  it('deleteFundingSource works as expected', async () => {
    const pfsId = 2;

    mock.onDelete(`/api/project/${projectId}/funding-sources/${pfsId}/delete`).reply(200, true);

    const result = await useProjectApi(axios).deleteFundingSource(projectId, pfsId);

    expect(result).toEqual(true);
  });

  it('makeAttachmentSecure works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/attachments/${attachmentId}/makeSecure`).reply(200, 1);

    const result = await useProjectApi(axios).makeAttachmentSecure(projectId, attachmentId, attachmentType);

    expect(result).toEqual(1);
  });

  it('makeAttachmentUnsecure works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/attachments/${attachmentId}/makeUnsecure`).reply(200, 1);

    const result = await useProjectApi(axios).makeAttachmentUnsecure(
      projectId,
      attachmentId,
      'token123',
      attachmentType
    );

    expect(result).toEqual(1);
  });

  it('uploadProjectAttachments works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/attachments/upload`).reply(200, 'result 1');

    const result = await useProjectApi(axios).uploadProjectAttachments(projectId, file, attachmentType, attachmentMeta);

    expect(result).toEqual('result 1');
  });

  it('createProject works as expected', async () => {
    const projectData = {
      coordinator: (null as unknown) as IProjectCoordinatorForm,
      permit: (null as unknown) as IProjectPermitForm,
      project: (null as unknown) as IProjectDetailsForm,
      objectives: (null as unknown) as IProjectObjectivesForm,
      location: (null as unknown) as IProjectLocationForm,
      iucn: (null as unknown) as IProjectIUCNForm,
      funding: (null as unknown) as IProjectFundingForm,
      partnerships: (null as unknown) as IProjectPartnershipsForm
    };

    mock.onPost('/api/project').reply(200, {
      id: 1
    });

    const result = await useProjectApi(axios).createProject(projectData);

    expect(result).toEqual({ id: 1 });
  });

  it('publishProject works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/publish`).reply(200, {
      id: 1
    });

    const result = await useProjectApi(axios).publishProject(projectId, true);

    expect(result).toEqual({ id: 1 });
  });

  it('getAttachmentSignedURL works as expected for public access', async () => {
    mock
      .onGet(`/api/public/project/${projectId}/attachments/${attachmentId}/getSignedUrl`, {
        query: { attachmentType: 'Other' }
      })
      .reply(200, 'www.signedurl.com');

    const result = await usePublicProjectApi(axios).getAttachmentSignedURL(projectId, attachmentId, 'Other');

    expect(result).toEqual('www.signedurl.com');
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

  it('getProjectAttachments works as expected', async () => {
    mock.onGet(`/api/public/project/${projectId}/attachments/list`).reply(200, {
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 3028
        }
      ]
    });

    const result = await usePublicProjectApi(axios).getProjectAttachments(projectId);

    expect(result.attachmentsList).toEqual([
      {
        id: 1,
        fileName: 'filename',
        lastModified: '2020/04/04',
        size: 3028
      }
    ]);
  });

  it('updateProjectAttachmentMetadata works as expected', async () => {
    mock.onPut(`/api/project/${projectId}/attachments/${attachmentId}/metadata/update`).reply(200, 'result 1');

    const result = await useProjectApi(axios).updateProjectReportMetadata(
      projectId,
      attachmentId,
      attachmentMetaForUpdate,
      attachmentMetaForUpdate.revision_count
    );

    expect(result).toEqual('result 1');
  });

  it('getProjectReportMetadata works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/attachments/${attachmentId}/metadata/get`).reply(200, 'result 1');

    const result = await useProjectApi(axios).getProjectReportMetadata(projectId, attachmentId);

    expect(result).toEqual('result 1');
  });

  it('getProjectParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/project/${projectId}/participants/get`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getProjectParticipants(projectId);

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
