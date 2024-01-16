import { AuthStateContext } from 'contexts/authStateContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ProjectDetailsFormInitialValues } from 'features/projects/components/ProjectDetailsForm';
import { ProjectIUCNFormInitialValues } from 'features/projects/components/ProjectIUCNForm';
import { ProjectObjectivesFormInitialValues } from 'features/projects/components/ProjectObjectivesForm';
import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import { createMemoryHistory } from 'history';
import { GetRegionsResponse } from 'hooks/api/useSpatialApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IDraftResponse } from 'interfaces/useDraftApi.interface';
import { ICreateProjectResponse } from 'interfaces/useProjectApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { MemoryRouter, Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import {
  cleanup,
  findByText as rawFindByText,
  fireEvent,
  getByText as rawGetByText,
  render,
  waitFor
} from 'test-helpers/test-utils';
import { AddProjectParticipantsFormInitialValues } from '../participants/AddProjectParticipantsForm';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  draft: {
    createDraft: jest.fn<Promise<IDraftResponse>, []>(),
    updateDraft: jest.fn<Promise<IDraftResponse>, []>(),
    deleteDraft: jest.fn(),
    getDraft: jest.fn()
  },
  spatial: {
    getRegions: jest.fn<Promise<GetRegionsResponse>, []>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  project: {
    createProject: jest.fn<Promise<ICreateProjectResponse>, []>()
  },
  user: {
    searchSystemUser: jest.fn<Promise<ISystemUser[]>, []>()
  }
};

const mockCodesContext: ICodesContext = {
  codesDataLoader: {
    data: codes,
    load: () => {}
  } as DataLoader<any, any, any>
};

const authState = getMockAuthState({ base: SystemAdminAuthState });

const renderContainer = () => {
  return render(
    <AuthStateContext.Provider value={authState}>
      <CodesContext.Provider value={mockCodesContext}>
        <DialogContextProvider>
          <Router history={history}>
            <CreateProjectPage />,
          </Router>
        </DialogContextProvider>
      </CodesContext.Provider>
    </AuthStateContext.Provider>
  );
};

describe('CreateProjectPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.draft.createDraft.mockClear();
    mockUseApi.draft.updateDraft.mockClear();
    mockUseApi.draft.getDraft.mockClear();
    mockUseApi.spatial.getRegions.mockClear();
    mockUseApi.codes.getAllCodeSets.mockClear();
    mockUseApi.project.createProject.mockClear();
    mockUseApi.user.searchSystemUser.mockClear();

    mockUseApi.spatial.getRegions.mockResolvedValue({
      regions: []
    });

    mockUseApi.codes.getAllCodeSets.mockResolvedValue(codes);

    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the initial default page correctly', async () => {
    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Create New Project')).toBeVisible();

      expect(getByText('General Information')).toBeVisible();
    });
  });

  it('shows the page title', async () => {
    const { findByText } = renderContainer();
    const PageTitle = await findByText('Create New Project');

    expect(PageTitle).toBeVisible();
  });

  describe('Are you sure? Dialog', () => {
    it('shows warning dialog if the user clicks the `Cancel and Exit` button', async () => {
      history.push('/home');
      history.push('/admin/projects/create');

      const { findByText, getByRole, findAllByText } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
      const AreYouSureTitle = await findByText('Discard changes and exit?');
      const AreYouSureText = await findByText('Any changes you have made will not be saved. Do you want to proceed?', {
        exact: false
      });
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(AreYouSureTitle).toBeVisible();
      expect(AreYouSureText).toBeVisible();
      expect(AreYouSureYesButton).toBeVisible();
    });

    it('calls history.push() if the user clicks `Yes`', async () => {
      history.push('/home');
      history.push('/admin/projects/create');

      const { findAllByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
      const AreYouSureYesButton = await rawFindByText(getByRole('dialog'), 'Yes', { exact: false });

      expect(history.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureYesButton);
      expect(history.location.pathname).toEqual('/admin/projects');
    });

    it('does nothing if the user clicks `No`', async () => {
      history.push('/home');
      history.push('/admin/projects/create');

      const { findAllByText, getByRole } = renderContainer();
      const BackToProjectsButton = await findAllByText('Cancel');

      fireEvent.click(BackToProjectsButton[0]);
      const AreYouSureNoButton = await rawFindByText(getByRole('dialog'), 'No');

      expect(history.location.pathname).toEqual('/admin/projects/create');
      fireEvent.click(AreYouSureNoButton);
      expect(history.location.pathname).toEqual('/admin/projects/create');
    });
  });
});
