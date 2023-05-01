import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import ActiveUsersList, { IActiveUsersListProps } from './ActiveUsersList';

const history = createMemoryHistory();

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  user: {
    updateSystemUserRoles: jest.fn(),
    deleteSystemUser: jest.fn()
  },
  admin: {
    addSystemUser: jest.fn()
  }
};

((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(mockUseBiohubApi);

const renderContainer = (props: IActiveUsersListProps) => {
  return render(
    <Router history={history}>
      <ActiveUsersList {...props} />
    </Router>
  );
};

describe('ActiveUsersList', () => {
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
          id: 1,
          user_identifier: 'username',
          user_guid: 'user-guid',
          user_record_end_date: '2020-10-10',
          role_names: ['role 1', 'role 2']
        }
      ],
      codes: codes,
      refresh: () => {}
    });

    await waitFor(() => {
      expect(getByText('username')).toBeVisible();
      expect(getByText('role 1, role 2')).toBeVisible();
    });
  });

  it('shows a table row for an active user with fields not having values', async () => {
    const { getByTestId } = renderContainer({
      activeUsers: [
        {
          id: 1,
          user_identifier: 'username',
          user_guid: 'user-guid',
          user_record_end_date: '2020-10-10',
          role_names: []
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
