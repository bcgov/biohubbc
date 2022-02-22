import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { SYSTEM_IDENTITY_SOURCE } from 'components/layout/Header';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IAccessRequestDataObject, IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';

jest.mock('../../../hooks/useBioHubApi');
const mockUseBiohubApi = {
  admin: {
    updateAccessRequest: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

const renderContainer = (
  accessRequests: IGetAccessRequestsListResponse[],
  codes: IGetAllCodeSetsResponse,
  refresh: () => void
) => {
  return render(<AccessRequestList accessRequests={accessRequests} codes={codes} refresh={refresh} />);
};

describe('AccessRequestList', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().admin.updateAccessRequest.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows `No Access Requests` when there are no access requests', async () => {
    const { getByText } = renderContainer([], codes, () => {});

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
    });
  });

  it('shows a table row for a pending access request', async () => {
    const { getByText, getByRole } = renderContainer(
      [
        {
          id: 1,
          type: 1,
          type_name: 'test type',
          status: 1,
          status_name: 'Pending',
          description: 'test description',
          notes: 'test notes',
          data: {
            name: 'test user',
            username: 'testusername',
            email: 'email@email.com',
            role: 2,
            identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment',
            request_reason: 'my reason'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      () => {}
    );

    await waitFor(() => {
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('Apr 20, 2020')).toBeVisible();
      expect(getByText('Pending')).toBeVisible();
      expect(getByRole('button')).toHaveTextContent('Review');
    });
  });

  it('shows a table row for a rejected access request', async () => {
    const { getByText, queryByRole } = renderContainer(
      [
        {
          id: 1,
          type: 1,
          type_name: 'test type',
          status: 1,
          status_name: 'Rejected',
          description: 'test description',
          notes: 'test notes',
          data: {
            name: 'test user',
            username: 'testusername',
            email: 'email@email.com',
            role: 2,
            identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment',
            request_reason: 'my reason'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      () => {}
    );

    await waitFor(() => {
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('Apr 20, 2020')).toBeVisible();
      expect(getByText('Denied')).toBeVisible();
      expect(queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('shows a table row for a actioned access request', async () => {
    const { getByText, queryByRole } = renderContainer(
      [
        {
          id: 1,
          type: 1,
          type_name: 'test type',
          status: 1,
          status_name: 'Actioned',
          description: 'test description',
          notes: 'test notes',
          data: {
            name: 'test user',
            username: 'testusername',
            email: 'email@email.com',
            role: 2,
            identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment',
            request_reason: 'my reason'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      () => {}
    );

    await waitFor(() => {
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('Apr 20, 2020')).toBeVisible();
      expect(getByText('Approved')).toBeVisible();
      expect(queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('shows a table row when the data object is null', async () => {
    const { getByText } = renderContainer(
      [
        {
          id: 1,
          type: 1,
          type_name: 'test type',
          status: 1,
          status_name: 'Pending',
          description: 'test description',
          notes: 'test notes',
          data: (null as unknown) as IAccessRequestDataObject,
          create_date: '2020-04-20'
        }
      ],
      codes,
      () => {}
    );

    await waitFor(() => {
      expect(getByText('Apr 20, 2020')).toBeVisible();
      expect(getByText('Pending')).toBeVisible();
    });
  });

  it('opens the review dialog and calls updateAccessRequest on approval', async () => {
    const refresh = jest.fn();

    const { getByText, getByRole } = renderContainer(
      [
        {
          id: 1,
          type: 1,
          type_name: 'test type',
          status: 1,
          status_name: 'Pending',
          description: 'test description',
          notes: 'test notes',
          data: {
            name: 'test user',
            username: 'testusername',
            email: 'email@email.com',
            role: 2,
            identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment',
            request_reason: 'my reason'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      refresh
    );

    const reviewButton = getByRole('button');
    expect(reviewButton).toHaveTextContent('Review');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      // wait for dialog to open
      expect(getByText('Review Access Request')).toBeVisible();
      fireEvent.click(getByText('Approve'));
    });

    await waitFor(() => {
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().admin.updateAccessRequest).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().admin.updateAccessRequest).toHaveBeenCalledWith(
        'testusername',
        SYSTEM_IDENTITY_SOURCE.IDIR,
        1,
        2,
        [2]
      );
    });
  });

  it('opens the review dialog and calls updateAccessRequest on denial', async () => {
    const refresh = jest.fn();

    const { getByText, getByRole } = renderContainer(
      [
        {
          id: 1,
          type: 1,
          type_name: 'test type',
          status: 1,
          status_name: 'Pending',
          description: 'test description',
          notes: 'test notes',
          data: {
            name: 'test user',
            username: 'testusername',
            email: 'email@email.com',
            role: 1,
            identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment',
            request_reason: 'my reason'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      refresh
    );

    const reviewButton = getByRole('button');
    expect(reviewButton).toHaveTextContent('Review');
    fireEvent.click(reviewButton);

    await waitFor(() => {
      // wait for dialog to open
      expect(getByText('Review Access Request')).toBeVisible();
      fireEvent.click(getByText('Deny'));
    });

    await waitFor(() => {
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().admin.updateAccessRequest).toHaveBeenCalledTimes(1);
      expect(mockBiohubApi().admin.updateAccessRequest).toHaveBeenCalledWith(
        'testusername',
        SYSTEM_IDENTITY_SOURCE.IDIR,
        1,
        3
      );
    });
  });
});
