import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useResourcesApi from './useResourcesApi';

describe('useResourcesApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('listResources works as expected for an empty list', async () => {
    mock.onGet('/api/resources/list').reply(200, {
      files: []
    });

    const result = await useResourcesApi(axios).listResources();

    expect(result).toEqual({ files: [] });
  });

  it('listResources works as expected for a non-empty list', async () => {
    mock.onGet('/api/resources/list').reply(200, {
      files: [
        {
          fileName: 'filename',
          url: 'url',
          lastModified: 'lastmodified',
          fileSize: 10,
          metadata: {
            templateName: 'templatename',
            templateType: 'templatetype',
            species: 'species'
          }
        }
      ]
    });

    const result = await useResourcesApi(axios).listResources();

    expect(result.files).toBeDefined();
    expect(result.files.length).toEqual(1);
    expect(result.files[0]).toEqual({
      fileName: 'filename',
      url: 'url',
      lastModified: 'lastmodified',
      fileSize: 10,
      metadata: {
        templateName: 'templatename',
        templateType: 'templatetype',
        species: 'species'
      }
    });
  });
});
