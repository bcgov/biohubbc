import { AuthStateContext } from 'contexts/authStateContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { MemoryRouter, Router } from 'react-router-dom';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import ProjectsListPage from './ProjectsListPage';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  project: {
    getProjectsList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

describe('ProjectsListPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.project.getProjectsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with the create project button', async () => {
    mockUseApi.project.getProjectsList.mockResolvedValue({
      projects: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0
      }
    });

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown as ICodesContext;

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

  it('renders with the open advanced filters button', async () => {
    mockUseApi.project.getProjectsList.mockResolvedValue({
      projects: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0
      }
    });

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: [],
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown as ICodesContext;

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
      expect(getByText('Show Filters')).toBeInTheDocument();
    });
  });

  it('navigating to the project works', async () => {
    mockUseApi.project.getProjectsList.mockResolvedValue({
      projects: [
        {
          project_id: 1,
          name: 'Project 1',
          start_date: null,
          end_date: null,
          project_programs: [1],
          regions: ['region'],
          completion_status: 'Completed'
        }
      ],
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 1
      }
    });

    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const mockCodesContext: ICodesContext = {
      codesDataLoader: {
        data: codes,
        load: jest.fn(),
        refresh: jest.fn()
      } as unknown as DataLoader<any, any, any>,
      surveyId: 1,
      projectId: 1
    } as unknown as ICodesContext;

    const { findByText } = render(
      <AuthStateContext.Provider value={authState}>
        <CodesContext.Provider value={mockCodesContext}>
          <Router history={history}>
            <ProjectsListPage />
          </Router>
        </CodesContext.Provider>
      </AuthStateContext.Provider>
    );

    fireEvent.click(await findByText('Project 1'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/1');
    });
  });
});
