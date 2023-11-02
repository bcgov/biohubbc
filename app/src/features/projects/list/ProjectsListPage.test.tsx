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
  draft: {
    getDraftsList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

describe('ProjectsListPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.project.getProjectsList.mockClear();
    mockUseApi.draft.getDraftsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders with the create project button', async () => {
    mockUseApi.project.getProjectsList.mockResolvedValue([]);
    mockUseApi.draft.getDraftsList.mockResolvedValue([]);

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
    mockUseApi.project.getProjectsList.mockResolvedValue([]);
    mockUseApi.draft.getDraftsList.mockResolvedValue([]);

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

  it('renders with a list of drafts', async () => {
    mockUseApi.draft.getDraftsList.mockResolvedValue([
      {
        id: 1,
        name: 'Draft 1'
      }
    ]);
    mockUseApi.project.getProjectsList.mockResolvedValue([]);

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

    const { findByText } = render(
      <AuthStateContext.Provider value={authState}>
        <CodesContext.Provider value={mockCodesContext}>
          <MemoryRouter>
            <ProjectsListPage />
          </MemoryRouter>
        </CodesContext.Provider>
      </AuthStateContext.Provider>
    );

    expect(await findByText('Draft 1')).toBeInTheDocument();
  });

  it('navigating to the project works', async () => {
    mockUseApi.project.getProjectsList.mockResolvedValue([
      {
        projectData: {
          id: 1,
          name: 'Project 1',
          start_date: null,
          end_date: null,
          project_programs: [1],
          regions: ['region'],
          permits_list: '1, 2, 3',
          completion_status: 'Completed'
        },
        projectSupplementaryData: { has_unpublished_content: false }
      }
    ]);

    mockUseApi.draft.getDraftsList.mockResolvedValue([]);

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
