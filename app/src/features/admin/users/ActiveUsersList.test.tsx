import { render, waitFor } from '@testing-library/react';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React from 'react';
import ActiveUsersList from './ActiveUsersList';

const renderContainer = (activeUsers: IGetUserResponse[]) => {
  return render(<ActiveUsersList activeUsers={activeUsers} />);
};

describe('ActiveUsersList', () => {
  it('shows `No Active Users` when there are no active users', async () => {
    const { getByText } = renderContainer([]);

    await waitFor(() => {
      expect(getByText('No Active Users')).toBeVisible();
    });
  });

  it('shows a table row for an active user with all fields having values', async () => {
    const { getByText } = renderContainer([
      {
        id: 1,
        user_identifier: 'username',
        role_names: ['role 1', 'role 2']
      }
    ]);

    await waitFor(() => {
      expect(getByText('username')).toBeVisible();
      expect(getByText('role 1, role 2')).toBeVisible();
    });
  });

  it('shows a table row for an active user with fields not having values', async () => {
    const { getAllByText } = renderContainer([
      {
        id: 1,
        user_identifier: '',
        role_names: []
      }
    ]);

    await waitFor(() => {
      expect(getAllByText('Not Applicable').length).toEqual(2);
    });
  });
});
