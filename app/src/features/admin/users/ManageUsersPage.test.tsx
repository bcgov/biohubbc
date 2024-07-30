import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import ManageUsersPage from './ManageUsersPage';

const history = createMemoryHistory();

const renderContainer = () => {
  const authState = getMockAuthState({ base: SystemAdminAuthState });

  return render(
    <AuthStateContext.Provider value={authState}>
      <Router history={history}>
        <ManageUsersPage />
      </Router>
    </AuthStateContext.Provider>
  );
};

vi.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  admin: {
    getAdministrativeActivities: vi.fn()
  },
  user: {
    getUsersList: vi.fn()
  },
  codes: {
    getAllCodeSets: vi.fn()
  }
};

describe('ManageUsersPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.admin.getAdministrativeActivities.mockClear();
    mockUseApi.user.getUsersList.mockClear();
    mockUseApi.codes.getAllCodeSets.mockClear();

    // mock code set response
    mockUseApi.codes.getAllCodeSets.mockReturnValue({
      system_roles: [{ id: 1, name: 'Role 1' }],
      administrative_activity_status_type: [
        { id: 1, name: 'Actioned' },
        { id: 1, name: 'Rejected' }
      ]
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the main page content correctly', async () => {
    mockUseApi.admin.getAdministrativeActivities.mockReturnValue([]);
    mockUseApi.user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Manage Users')).toBeVisible();
    });
  });

  it('renders the access requests and active users component', async () => {
    mockUseApi.admin.getAdministrativeActivities.mockReturnValue([]);
    mockUseApi.user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
      expect(getByText('No Active Users')).toBeVisible();
    });
  });
});
