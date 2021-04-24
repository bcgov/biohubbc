import { cleanup, render, waitFor } from '@testing-library/react';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';

const renderContainer = () => {
  return render(<AccessRequestList />);
};

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  admin: {
    getAccessRequests: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('AccessRequestList', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().admin.getAccessRequests.mockClear();
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

  it('shows `No Access Requests` when there are no access requests', async () => {
    mockBiohubApi().admin.getAccessRequests.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
    });
  });

  it('shows a table row for a pending access request', async () => {
    mockBiohubApi().admin.getAccessRequests.mockReturnValue([
      {
        id: 1,
        status: 1,
        status_name: 'Pending',
        description: 'test description',
        notes: 'test notes',
        data: {
          name: 'test user',
          username: 'testusername',
          identitySource: 'idir',
          company: 'test company',
          regional_offices: ['office 1', 'office 2']
        },
        create_date: '2020-04-20'
      }
    ]);

    const { getByText, getByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('test user')).toBeVisible();
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('test company')).toBeVisible();
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('Pending')).toBeVisible();
      expect(getByRole('button')).toHaveTextContent('Review');
    });
  });

  it('shows a table row for a rejected access request', async () => {
    mockBiohubApi().admin.getAccessRequests.mockReturnValue([
      {
        id: 1,
        status: 1,
        status_name: 'Rejected',
        description: 'test description',
        notes: 'test notes',
        data: {
          name: 'test user',
          username: 'testusername',
          identitySource: 'idir',
          company: 'test company',
          regional_offices: ['office 1', 'office 2']
        },
        create_date: '2020-04-20'
      }
    ]);

    const { getByText, queryByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('test user')).toBeVisible();
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('test company')).toBeVisible();
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('Rejected')).toBeVisible();
      expect(queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('shows a table row for a actioned access request', async () => {
    mockBiohubApi().admin.getAccessRequests.mockReturnValue([
      {
        id: 1,
        status: 1,
        status_name: 'Actioned',
        description: 'test description',
        notes: 'test notes',
        data: {
          name: 'test user',
          username: 'testusername',
          identitySource: 'idir',
          company: 'test company',
          regional_offices: ['office 1', 'office 2']
        },
        create_date: '2020-04-20'
      }
    ]);

    const { getByText, queryByRole } = renderContainer();

    await waitFor(() => {
      expect(getByText('test user')).toBeVisible();
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('test company')).toBeVisible();
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('Actioned')).toBeVisible();
      expect(queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('shows a table row when the data object is null', async () => {
    mockBiohubApi().admin.getAccessRequests.mockReturnValue([
      {
        id: 1,
        status: 1,
        status_name: 'Actioned',
        description: 'test description',
        notes: 'test notes',
        data: null,
        create_date: '2020-04-20'
      }
    ]);

    const { getByText, getAllByText } = renderContainer();

    await waitFor(() => {
      expect(getAllByText('Not Applicable').length).toEqual(4);
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('Actioned')).toBeVisible();
    });
  });
});
