import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { ICreateProjectRequest, IFindProjectsResponse, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { ISurveyPermitForm } from '../../features/surveys/SurveyPermitForm';
import useProjectApi from './useProjectApi';

describe('useProjectApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

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

  it('findProjects works as expected', async () => {
    const mockResponse: IFindProjectsResponse = {
      projects: [
        {
          project_id: 1,
          name: 'name',
          regions: [],
          focal_species: [123, 456],
          types: [1, 2, 3]
        }
      ],
      pagination: {
        total: 100,
        current_page: 2,
        last_page: 4,
        per_page: 25
      }
    };

    mock.onGet('/api/project', { params: { limit: 25, page: 2, keyword: 'moose' } }).reply(200, mockResponse);

    const result = await useProjectApi(axios).findProjects({ limit: 25, page: 2 }, { keyword: 'moose' });

    expect(result).toEqual(mockResponse);
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
      permit: null as unknown as ISurveyPermitForm,
      project: null as unknown as IProjectDetailsForm,
      objectives: null as unknown as IProjectObjectivesForm,
      iucn: null as unknown as IProjectIUCNForm
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
});
