import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import useProjectApi from './useProjectApi';

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

  it('deleteProjectAttachment works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/attachments/${attachmentId}/delete`).reply(200, 1);

    const result = await useProjectApi(axios).deleteProjectAttachment(projectId, attachmentId);

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
        focal_species_name_list: 'focal',
        regions_name_list: 'regions'
      }
    ];

    mock.onGet(`/api/projects`).reply(200, response);

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
});
