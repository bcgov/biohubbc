import { render, waitFor } from '@testing-library/react';
import { IActiveUsersListProps } from './ActiveUsersList';
import React from 'react';
import ActiveUsersList from './ActiveUsersList';
import { codes } from 'test-helpers/code-helpers';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';

const history = createMemoryHistory();

const renderContainer = (props: IActiveUsersListProps) => {
  return render(
    <Router history={history}>
      <ActiveUsersList {...props} />
    </Router>
  );
};

describe('ActiveUsersList', () => {
  it('shows `No Active Users` when there are no active users', async () => {
    const mockGetUsers = jest.fn();
    const { getByText } = renderContainer({
      activeUsers: [],
      codes: codes,
      getUsers: mockGetUsers
    });

    await waitFor(() => {
      expect(getByText('No Active Users')).toBeVisible();
    });
  });

  it('shows a table row for an active user with all fields having values', async () => {
    const mockGetUsers = jest.fn();

    const { getByText } = renderContainer({
      activeUsers: [
        {
          id: 1,
          user_identifier: 'username',
          user_record_end_date: '2020-10-10',
          role_names: ['role 1', 'role 2']
        }
      ],
      codes: codes,
      getUsers: mockGetUsers
    });

    await waitFor(() => {
      expect(getByText('username')).toBeVisible();
      expect(getByText('role 1, role 2')).toBeVisible();
    });
  });

  it('shows a table row for an active user with fields not having values', async () => {
    const mockGetUsers = jest.fn();
    const { getByTestId } = renderContainer({
      activeUsers: [
        {
          id: 1,
          user_identifier: 'username',
          user_record_end_date: '2020-10-10',
          role_names: []
        }
      ],
      codes: codes,
      getUsers: mockGetUsers
    });

    await waitFor(() => {
      expect(getByTestId('custom-menu-button-NotApplicable')).toBeInTheDocument();
    });
  });

  it('renders the add new users button correctly', async () => {
    const mockGetUsers = jest.fn();
    const { getByTestId } = renderContainer({
      activeUsers: [],
      codes: codes,
      getUsers: mockGetUsers
    });

    await waitFor(() => {
      expect(getByTestId('invite-system-users-button')).toBeVisible();
    });
  });
});
