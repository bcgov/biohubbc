import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import ActiveUsersList, { IActiveUsersListProps } from './ActiveUsersList';

const history = createMemoryHistory();

vi.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  user: {
    updateSystemUserRoles: vi.fn(),
    deleteSystemUser: vi.fn()
  },
  admin: {
    addSystemUser: vi.fn()
  }
};

const renderContainer = (props: IActiveUsersListProps) => {
  const authState = getMockAuthState({ base: SystemAdminAuthState });

  return render(
    <AuthStateContext.Provider value={authState}>
      <Router history={history}>
        <ActiveUsersList {...props} />
      </Router>
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
      codes: codes,
      refresh: () => {}
    });

    await waitFor(() => {
      expect(getByText('No Active Users')).toBeVisible();
    });
  });

  it('shows a table row for an active user with all fields having values', async () => {
    const { getByText } = renderContainer({
      activeUsers: [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'user-guid',
          record_end_date: '2020-10-10',
          role_names: ['role 1'],
          identity_source: 'idir',
          role_ids: [1],
          email: '',
          display_name: '',
          agency: ''
        }
      ],
      codes: codes,
      refresh: () => {}
    });

    await waitFor(() => {
      expect(getByText('username')).toBeVisible();
      expect(getByText('role 1')).toBeVisible();
    });
  });

  it('shows a table row for an active user with fields not having values', async () => {
    const { getByTestId } = renderContainer({
      activeUsers: [
        {
          system_user_id: 1,
          user_identifier: 'username',
          user_guid: 'user-guid',
          record_end_date: '2020-10-10',
          role_names: [],
          identity_source: 'idir',
          role_ids: [],
          email: '',
          display_name: '',
          agency: ''
        }
      ],
      codes: codes,
      refresh: () => {}
    });

    await waitFor(() => {
      expect(getByTestId('custom-menu-button-NotApplicable')).toBeInTheDocument();
    });
  });

  it('renders the add new users button correctly', async () => {
    const { getByTestId } = renderContainer({
      activeUsers: [],
      codes: codes,
      refresh: () => {}
    });

    await waitFor(() => {
      expect(getByTestId('invite-system-users-button')).toBeVisible();
    });
  });
});
