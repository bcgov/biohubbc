import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { GetRegionsResponse } from 'hooks/api/useSpatialApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { geoJsonFeature } from 'test-helpers/spatial-helpers';
import { getSurveyForListResponse } from 'test-helpers/survey-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import LocationBoundary from './LocationBoundary';

jest.mock('../../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  project: {
    getProjectForUpdate: jest.fn<Promise<object>, []>(),
    updateProject: jest.fn()
  },
  external: {
    get: jest.fn()
  },
  spatial: {
    getRegions: jest.fn<Promise<GetRegionsResponse>, []>()
  }
};

const mockRefresh = jest.fn();

describe.skip('LocationBoundary', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.project.getProjectForUpdate.mockClear();
    mockUseApi.project.updateProject.mockClear();
    mockUseApi.external.get.mockClear();
    mockUseApi.spatial.getRegions.mockClear();

    mockUseApi.external.get.mockResolvedValue({
      features: []
    });
    mockUseApi.spatial.getRegions.mockResolvedValue({
      regions: []
    });

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it.skip('matches the snapshot when there is no location description', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          ...getProjectForViewResponse.projectData,
          location: {
            ...getProjectForViewResponse.projectData.location,
            location_description: null as unknown as string
          }
        }
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <LocationBoundary />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it.skip('matches the snapshot when there is no geometry', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          ...getProjectForViewResponse,
          projectData: {
            ...getProjectForViewResponse.projectData,
            location: { ...getProjectForViewResponse.projectData.location, geometry: [] }
          }
        }
      } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <LocationBoundary />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it.skip('matches the snapshot when the geometry is a single polygon in valid GeoJSON format', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: {
          ...getProjectForViewResponse,
          projectData: {
            ...getProjectForViewResponse.projectData,
            location: { ...getProjectForViewResponse.projectData.location, geometry: geoJsonFeature }
          }
        }
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    const { asFragment } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <LocationBoundary />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('editing the location boundary works in the dialog', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    mockUseApi.project.getProjectForUpdate.mockResolvedValue({
      location: {
        location_description: 'description',
        geometry: geoJsonFeature,
        revision_count: 1
      }
    });

    const { getByText, queryByText } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <ProjectContext.Provider value={mockProjectContext}>
          <LocationBoundary />
        </ProjectContext.Provider>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockUseApi.project.getProjectForUpdate).toBeCalledWith(
        getProjectForViewResponse.projectData.project.project_id,
        [UPDATE_GET_ENTITIES.location]
      );
    });

    await waitFor(() => {
      expect(getByText('Edit Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Cancel'));

    await waitFor(() => {
      expect(queryByText('Edit Project Location')).not.toBeInTheDocument();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Edit Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUseApi.project.updateProject).toHaveBeenCalledTimes(1);
      expect(mockUseApi.project.updateProject).toBeCalledWith(
        getProjectForViewResponse.projectData.project.project_id,
        {
          location: {
            location_description: 'description',
            geometry: geoJsonFeature,
            revision_count: 1
          }
        }
      );

      expect(mockRefresh).toBeCalledTimes(1);
    });
  });

  it('displays an error dialog when fetching the update data fails', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    mockUseApi.project.getProjectForUpdate.mockResolvedValue({
      location: null
    });

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <CodesContext.Provider value={mockCodesContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <LocationBoundary />
          </ProjectContext.Provider>
        </CodesContext.Provider>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(getByText('Error Editing Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('Error Editing Project Location')).not.toBeInTheDocument();
    });
  });

  it('shows error dialog with API error message when getting location data for update fails', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    mockUseApi.project.getProjectForUpdate = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText } = render(
      <DialogContextProvider>
        <CodesContext.Provider value={mockCodesContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <LocationBoundary />
          </ProjectContext.Provider>
        </CodesContext.Provider>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it('shows error dialog with API error message when updating location data fails', async () => {
    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes
      } as DataLoader<any, any, any>
    };
    const mockProjectContext: IProjectContext = {
      projectDataLoader: {
        data: getProjectForViewResponse
      } as DataLoader<any, any, any>,
      artifactDataLoader: { data: null } as DataLoader<any, any, any>,
      surveysListDataLoader: { data: getSurveyForListResponse } as DataLoader<any, any, any>,
      projectId: 1
    };

    mockUseApi.project.getProjectForUpdate.mockResolvedValue({
      location: {
        location_description: 'description',
        geometry: geoJsonFeature,
        revision_count: 1
      }
    });
    mockUseApi.project.updateProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, queryByText, getAllByRole } = render(
      <DialogContextProvider>
        <CodesContext.Provider value={mockCodesContext}>
          <ProjectContext.Provider value={mockProjectContext}>
            <LocationBoundary />
          </ProjectContext.Provider>
        </CodesContext.Provider>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByText('Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Edit'));

    await waitFor(() => {
      expect(mockUseApi.project.getProjectForUpdate).toBeCalledWith(
        getProjectForViewResponse.projectData.project.project_id,
        [UPDATE_GET_ENTITIES.location]
      );
    });

    await waitFor(() => {
      expect(getByText('Edit Project Location')).toBeVisible();
    });

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });
});
