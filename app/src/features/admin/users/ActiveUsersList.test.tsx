import { cleanup, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import ActiveUsersList from './ActiveUsersList';

const renderContainer = () => {
  return render(<ActiveUsersList />);
};

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  user: {
    getUsersList: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ActiveUsersList', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().user.getUsersList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows `No Active Users` when there are no active users', async () => {
    mockBiohubApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Active Users')).toBeVisible();
    });
  });

  it('shows a table row for an active user with all fields having values', async () => {
    mockBiohubApi().user.getUsersList.mockReturnValue([
      {
        id: 1,
        user_identifier: 'username',
        role_names: ['role 1', 'role 2']
      }
    ]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('username')).toBeVisible();
      expect(getByText('role 1, role 2')).toBeVisible();
    });
  });

  it('shows a table row for an active user with fields not having values', async () => {
    mockBiohubApi().user.getUsersList.mockReturnValue([
      {
        id: 1,
        user_identifier: '',
        role_names: []
      }
    ]);

    const { getAllByText } = renderContainer();

    await waitFor(() => {
      expect(getAllByText('Not Applicable').length).toEqual(2);
    });
  });
});
