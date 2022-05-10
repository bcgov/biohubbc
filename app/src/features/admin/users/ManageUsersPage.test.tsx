import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import { Router } from 'react-router';
import ManageUsersPage from './ManageUsersPage';

const history = createMemoryHistory();

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ManageUsersPage />
    </Router>
  );
};

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  admin: {
    getAdministrativeActivities: jest.fn()
  },
  user: {
    getUsersList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ManageUsersPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().admin.getAdministrativeActivities.mockClear();
    mockBiohubApi().user.getUsersList.mockClear();
    mockBiohubApi().codes.getAllCodeSets.mockClear();

    // mock code set response
    mockBiohubApi().codes.getAllCodeSets.mockReturnValue({
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
    mockBiohubApi().admin.getAdministrativeActivities.mockReturnValue([]);
    mockBiohubApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Manage Users')).toBeVisible();
    });
  });

  it('renders the access requests and active users component', async () => {
    mockBiohubApi().admin.getAdministrativeActivities.mockReturnValue([]);
    mockBiohubApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
      expect(getByText('No Active Users')).toBeVisible();
    });
  });
});
