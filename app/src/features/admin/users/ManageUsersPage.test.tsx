import { cleanup, render, waitFor } from '@testing-library/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import ManageUsersPage from './ManageUsersPage';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';

const history = createMemoryHistory();

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ManageUsersPage />
    </Router>
  );
};

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  admin: {
    getAccessRequests: jest.fn()
  },
  user: {
    getUsersList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('ManageUsersPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().admin.getAccessRequests.mockClear();
    mockRestorationTrackerApi().user.getUsersList.mockClear();
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();

    // mock code set response
    mockRestorationTrackerApi().codes.getAllCodeSets.mockReturnValue({
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
    mockRestorationTrackerApi().admin.getAccessRequests.mockReturnValue([]);
    mockRestorationTrackerApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Manage Users')).toBeVisible();
    });
  });

  it('renders the access requests and active users component', async () => {
    mockRestorationTrackerApi().admin.getAccessRequests.mockReturnValue([]);
    mockRestorationTrackerApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
      expect(getByText('No Active Users')).toBeVisible();
    });
  });
});
