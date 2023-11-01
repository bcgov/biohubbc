import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { GetRegionsResponse } from 'hooks/api/useSpatialApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState, SystemUserAuthState } from 'test-helpers/auth-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import ProjectPage from './ProjectPage';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>(),
    deleteProject: jest.fn(),
    publishProject: jest.fn()
  },
  survey: {
    getSurveysBasicFieldsByProjectId: jest.fn().mockResolvedValue([])
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  spatial: {
    getRegions: jest.fn<Promise<GetRegionsResponse>, []>()
  }
};

describe.skip('ProjectPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.project.deleteProject.mockClear();
    mockUseApi.project.getProjectForView.mockClear();
    mockUseApi.survey.getSurveysBasicFieldsByProjectId.mockClear();
    mockUseApi.codes.getAllCodeSets.mockClear();
    mockUseApi.project.publishProject.mockClear();
    mockUseApi.spatial.getRegions.mockClear();

    mockUseApi.spatial.getRegions.mockResolvedValue({
      regions: []
    });

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it.skip('renders a spinner if no project is loaded', () => {
    const { asFragment } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('renders project page when project is loaded (project is active)', async () => {
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it.skip('renders project page when project is loaded (project is completed)', async () => {
    mockUseApi.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      projectData: {
        ...getProjectForViewResponse.projectData,
        project: { ...getProjectForViewResponse.projectData.project, completion_status: 'Completed' }
      }
    });
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it.skip('deletes project and takes user to the projects list page when user is a system administrator', async () => {
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.project.deleteProject.mockResolvedValue(true);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByTestId, findByText, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <DialogContextProvider>
          <Router history={history}>
            <ProjectPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    fireEvent.click(getByTestId('delete-project-button'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this project, its attachments and associated surveys/observations?')
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual(`/admin/projects`);
    });
  });

  it('shows basic error dialog when deleting project call has no response', async () => {
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.project.deleteProject.mockResolvedValue(null);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getAllByRole, queryByText, getByText, findByText, getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <DialogContextProvider>
          <Router history={history}>
            <ProjectPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    fireEvent.click(getByTestId('delete-project-button'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this project, its attachments and associated surveys/observations?')
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

    await waitFor(() => {
      expect(queryByText('Error Deleting Project')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('Error Deleting Project')).toBeNull();
    });
  });

  it('shows error dialog with API error message when deleting project fails', async () => {
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.project.deleteProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getAllByRole, queryByText, getByText, findByText, getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <DialogContextProvider>
          <Router history={history}>
            <ProjectPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    fireEvent.click(getByTestId('delete-project-button'));

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete this project, its attachments and associated surveys/observations?')
      ).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('yes-button'));

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

  it('sees delete project button as enabled when accessing a project as a project administrator', async () => {
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockUseApi.project.deleteProject.mockResolvedValue(true);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByTestId, findByText } = render(
      <AuthStateContext.Provider value={authState}>
        <DialogContextProvider>
          <Router history={history}>
            <ProjectPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    expect(getByTestId('delete-project-button')).toBeEnabled();
  });

  it('does not see the delete button when accessing project as non admin user', async () => {
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockUseApi.project.getProjectForView.mockResolvedValue(getProjectForViewResponse);

    const authState = getMockAuthState({ base: SystemUserAuthState });

    const { queryByTestId, findByText } = render(
      <AuthStateContext.Provider value={authState}>
        <DialogContextProvider>
          <Router history={history}>
            <ProjectPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    expect(queryByTestId('delete-project-button')).toBeNull();
  });

  it('renders correctly with no end date', async () => {
    mockUseApi.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      projectData: {
        ...getProjectForViewResponse.projectData,
        project: {
          ...getProjectForViewResponse.projectData.project,
          end_date: null as unknown as string
        }
      }
    });
    mockUseApi.codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);

    const { asFragment, findByText } = render(
      <Router history={history}>
        <ProjectPage />
      </Router>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1 span' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
