import { AuthStateContext } from 'contexts/authStateContext';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { DataLoader } from 'hooks/useDataLoader';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import ActiveUsersList, { IActiveUsersListProps } from './ActiveUsersList';

const history = createMemoryHistory();

jest.mock('../../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  user: {
    updateSystemUserRoles: jest.fn(),
    deleteSystemUser: jest.fn()
  },
  admin: {
    addSystemUser: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

const mockCodesContext: ICodesContext = {
  codesDataLoader: {
    data: codes,
    load: () => {}
  } as DataLoader<any, any, any>
};

const renderContainer = (props: IActiveUsersListProps) => {
  const authState = getMockAuthState({ base: SystemAdminAuthState });

  return render(
    <AuthStateContext.Provider value={authState}>
      <CodesContext.Provider value={mockCodesContext}>
        <Router history={history}>
          <ActiveUsersList {...props} />
        </Router>
      </CodesContext.Provider>
    </AuthStateContext.Provider>
  );
};

describe('ActiveUsersList', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows `No Active Users` when there are no active users', async () => {
    const { getByText } = renderContainer({
      activeUsers: [],
      refresh: () => {}
    });

    await waitFor(() => {
      expect(getByText('No Active Users')).toBeVisible();
    });
  });

  it('renders the add new users button correctly', async () => {
    const { getByTestId } = renderContainer({
      activeUsers: [],
      refresh: () => {}
    });

    await waitFor(() => {
      expect(getByTestId('invite-system-users-button')).toBeVisible();
    });
  });
});
