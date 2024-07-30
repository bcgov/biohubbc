import { useBiohubApi } from 'hooks/useBioHubApi';
import { IListResourcesResponse } from 'interfaces/useResourcesApi.interface';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import ResourcesPage from './ResourcesPage';

vi.mock('../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  resources: {
    listResources: vi.fn()
  }
};

const renderContainer = () => {
  return render(<ResourcesPage />);
};

describe('ResourcesPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.resources.listResources.mockClear();

    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it("shows 'No Resources Available' when there are no active users", async () => {
    mockUseApi.resources.listResources.mockResolvedValue({
      files: []
    } as unknown as IListResourcesResponse);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Resources')).toBeVisible();
    });

    expect(getByText('No Resources Available')).toBeVisible();
  });

  it('renders the initial default page correctly', async () => {
    mockUseApi.resources.listResources.mockResolvedValue({
      files: [
        {
          fileName: 'key1',
          url: 'host.example.com/key1',
          lastModified: new Date().toISOString(),
          fileSize: 10000,
          metadata: {
            templateName: 'template1',
            templateType: 'template-type',
            species: 'species'
          }
        },
        {
          fileName: 'key2',
          url: 'host.example.com/key2',
          lastModified: new Date().toISOString(),
          fileSize: 10000,
          metadata: {
            templateName: 'template2',
            templateType: 'template-type',
            species: 'species'
          }
        }
      ]
    } as unknown as IListResourcesResponse);

    const { getByText, queryByText, getAllByText, getByTestId } = renderContainer();

    await waitFor(() => {
      expect(getByText('Resources')).toBeVisible();
    });

    expect(getByTestId('resources-table')).toBeInTheDocument();
    expect(getByText('template1')).toBeVisible();
    expect(getByText('template2')).toBeVisible();
    expect(getByText('template1').getAttribute('href')).toEqual('https://host.example.com/key1');
    expect(getByText('template2').getAttribute('href')).toEqual('https://host.example.com/key2');
    expect(queryByText('key1')).not.toBeInTheDocument();
    expect(queryByText('key2')).not.toBeInTheDocument();
    expect(getAllByText('template-type').length).toEqual(2);
    expect(getAllByText('template-type')[0]).toBeVisible();
    expect(getAllByText('template-type')[1]).toBeVisible();
  });

  it('renders templates with missing metadata', async () => {
    mockUseApi.resources.listResources.mockResolvedValue({
      files: [
        {
          fileName: 'key1',
          url: 'host.example.com/key1',
          lastModified: new Date().toISOString(),
          fileSize: 10000,
          metadata: {}
        },
        {
          fileName: 'key2',
          url: 'host.example.com/key2',
          lastModified: new Date().toISOString(),
          fileSize: 10000,
          metadata: {}
        }
      ]
    } as unknown as IListResourcesResponse);

    const { getByText, getAllByText, getByTestId } = renderContainer();

    await waitFor(() => {
      expect(getByText('Resources')).toBeVisible();
    });

    expect(getByTestId('resources-table')).toBeInTheDocument();
    expect(getByText('key1')).toBeVisible();
    expect(getByText('key2')).toBeVisible();
    expect(getByText('key1').getAttribute('href')).toEqual('https://host.example.com/key1');
    expect(getByText('key2').getAttribute('href')).toEqual('https://host.example.com/key2');
    expect(getAllByText('Other').length).toEqual(2);
    expect(getAllByText('Other')[0]).toBeVisible();
    expect(getAllByText('Other')[1]).toBeVisible();
  });
});
