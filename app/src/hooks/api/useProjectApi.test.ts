import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
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

  const projectId = 1;
  const attachmentId = 1;
  const attachmentType = 'type';

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

  it('getAttachmentSignedURL works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/attachments/${attachmentId}/getSignedUrl`).reply(200, 'www.signedurl.com');

    const result = await useProjectApi(axios).getAttachmentSignedURL(projectId, attachmentId);

    expect(result).toEqual('www.signedurl.com');
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

    const result = await useProjectApi(axios).uploadProjectAttachments(projectId, file, attachmentType);

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

  it('getAttachmentSignedURL works as expected', async () => {
    mock
      .onPost(`/api/public/project/${projectId}/attachments/${attachmentId}/getSignedUrl`)
      .reply(200, 'www.signedurl.com');

    const result = await usePublicProjectApi(axios).getAttachmentSignedURL(projectId, attachmentId, 'Image');

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
});
