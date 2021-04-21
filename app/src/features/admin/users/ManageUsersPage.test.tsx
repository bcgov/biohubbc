import { cleanup, render, waitFor } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';
import ManageUsersPage from './ManageUsersPage';

const renderContainer = () => {
  return render(<ManageUsersPage />);
};

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  admin: {
    getAccessRequests: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('ManageUsersPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().admin.getAccessRequests.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders correctly', async () => {
    mockBiohubApi().admin.getAccessRequests.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Manage Users')).toBeVisible();
    });
  });

  it('renders the access requests component', async () => {
    mockBiohubApi().admin.getAccessRequests.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
    });
  });
});
