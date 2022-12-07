import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { Feature } from 'geojson';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ProjectPage from './ProjectPage';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>(),
    deleteProject: jest.fn(),
    publishProject: jest.fn()
  },
  survey: {
    getSurveysList: jest.fn().mockResolvedValue([])
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  external: {
    post: jest.fn<Promise<{ features?: Feature[] }>, []>()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const defaultAuthState = {
  keycloakWrapper: {
    keycloak: {
      authenticated: true
    },
    hasLoadedAllUserInfo: true,
    systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
    getUserIdentifier: () => 'testuser',
    hasAccessRequest: false,
    hasSystemRole: () => true,
    getIdentitySource: () => 'idir',
    username: 'testusername',
    displayName: 'testdisplayname',
    email: 'test@email.com',
    firstName: 'testfirst',
    lastName: 'testlast',
    refresh: () => {}
  }
};

describe.skip('ProjectPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().project.deleteProject.mockClear();
    mockBiohubApi().project.getProjectForView.mockClear();
    mockBiohubApi().survey.getSurveysList.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();
    mockBiohubApi().project.publishProject.mockClear();
    mockBiohubApi().external.post.mockClear();

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', () => {
    const { asFragment } = render(
      <DialogContextProvider>
        <Router history={history}>
          <ProjectPage />
        </Router>
      </DialogContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders project page when project is loaded (project is active)', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

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

  it('renders project page when project is loaded (project is completed)', async () => {
    mockBiohubApi().project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, completion_status: 'Completed' }
    });
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

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

  it('deletes project and takes user to the projects list page when user is a system administrator', async () => {
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().project.deleteProject.mockResolvedValue(true);
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    };

    const { getByTestId, findByText, getByText } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
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
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().project.deleteProject.mockResolvedValue(null);
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    };

    const { getAllByRole, queryByText, getByText, findByText, getByTestId } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
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
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().project.deleteProject = jest.fn(() => Promise.reject(new Error('API Error is Here')));
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    };

    const { getAllByRole, queryByText, getByText, findByText, getByTestId } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
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
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project }
    });
    mockBiohubApi().project.deleteProject.mockResolvedValue(true);
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    };

    const { getByTestId, findByText } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
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
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().project.getProjectForView.mockResolvedValue(getProjectForViewResponse);
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: ['Non Admin User'] as string[],
        hasSystemRole: () => false
      }
    };

    const { queryByTestId, findByText } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
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
    mockBiohubApi().project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: {
        ...getProjectForViewResponse.project,
        end_date: (null as unknown) as string
      }
    });
    mockBiohubApi().codes.getAllCodeSets.mockResolvedValue({
      activity: [{ id: 1, name: 'activity 1' }]
    } as any);
    mockBiohubApi().external.post.mockResolvedValue({
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        }
      ]
    });

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
