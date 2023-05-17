import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import React from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import ProjectsListPage from './ProjectsListPage';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  project: {
    getProjectsList: jest.fn()
  },
  draft: {
    getDraftsList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ProjectsListPage', () => {
  beforeEach(() => {
    mockBiohubApi().project.getProjectsList.mockClear();
    mockBiohubApi().draft.getDraftsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders with the create project button', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);
    mockBiohubApi().draft.getDraftsList.mockResolvedValue([]);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const mockCodesContext: ICodesContext = ({
      codesDataLoader: ({
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ICodesContext;

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <CodesContext.Provider value={mockCodesContext}>
          <MemoryRouter>
            <ProjectsListPage />
          </MemoryRouter>
        </CodesContext.Provider>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Create Project')).toBeInTheDocument();
    });
  });

  test('renders with the open advanced filters button', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);
    mockBiohubApi().draft.getDraftsList.mockResolvedValue([]);

    const mockCodesContext: ICodesContext = ({
      codesDataLoader: ({
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ICodesContext;

    const { getByText } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <MemoryRouter>
          <ProjectsListPage />
        </MemoryRouter>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Show Filters')).toBeInTheDocument();
    });
  });

  test('renders with a list of drafts', async () => {
    mockBiohubApi().draft.getDraftsList.mockResolvedValue([
      {
        id: 1,
        name: 'Draft 1'
      }
    ]);
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

    const mockCodesContext: ICodesContext = ({
      codesDataLoader: ({
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ICodesContext;

    const { getByText, getByTestId } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <MemoryRouter>
          <ProjectsListPage />
        </MemoryRouter>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(getByText('Draft 1')).toBeInTheDocument();
    });
  });

  test('navigating to the create project page works', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([]);

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const mockCodesContext: ICodesContext = ({
      codesDataLoader: ({
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ICodesContext;

    const { getByText, getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <CodesContext.Provider value={mockCodesContext}>
          <Router history={history}>
            <ProjectsListPage />
          </Router>
        </CodesContext.Provider>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Create Project'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/create');
      expect(history.location.search).toEqual('');
    });
  });

  test('navigating to the create project page works on draft projects', async () => {
    mockBiohubApi().draft.getDraftsList.mockResolvedValue([
      {
        id: 1,
        name: 'Draft 1'
      }
    ]);

    const mockCodesContext: ICodesContext = ({
      codesDataLoader: ({
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ICodesContext;

    const { getByTestId } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <Router history={history}>
          <ProjectsListPage />
        </Router>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('Draft 1'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/create');
      expect(history.location.search).toEqual('?draftId=1');
    });
  });

  test('navigating to the project works', async () => {
    mockBiohubApi().project.getProjectsList.mockResolvedValue([
      {
        projectData: {
          id: 1,
          name: 'Project 1',
          start_date: null,
          end_date: null,
          coordinator_agency: 'contact agency',
          project_type: 'project type',
          permits_list: '1, 2, 3',
          completion_status: 'Completed'
        },
        projectSupplementaryData: { has_unpublished_content: false }
      }
    ]);

    mockBiohubApi().draft.getDraftsList.mockResolvedValue([]);

    const mockCodesContext: ICodesContext = ({
      codesDataLoader: ({
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown) as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown) as ICodesContext;

    const { getByTestId } = render(
      <CodesContext.Provider value={mockCodesContext}>
        <Router history={history}>
          <ProjectsListPage />
        </Router>
      </CodesContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('Project 1'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/1');
    });
  });
});
