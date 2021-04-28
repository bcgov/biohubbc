import { codes } from 'test-helpers/code-helpers';
import { render, waitFor } from '@testing-library/react';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import { IAccessRequestDataObject, IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';

const renderContainer = (
  accessRequests: IGetAccessRequestsListResponse[],
  codes: IGetAllCodeSetsResponse,
  refresh: () => void
) => {
  return render(<AccessRequestList accessRequests={accessRequests} codes={codes} refresh={refresh} />);
};

describe('AccessRequestList', () => {
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
            role: 2,
            identitySource: 'idir',
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      () => {}
    );

    await waitFor(() => {
      expect(getByText('test user')).toBeVisible();
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('test company')).toBeVisible();
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('PENDING')).toBeVisible();
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
            role: 2,
            identitySource: 'idir',
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      () => {}
    );

    await waitFor(() => {
      expect(getByText('test user')).toBeVisible();
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('test company')).toBeVisible();
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('DENIED')).toBeVisible();
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
            role: 2,
            identitySource: 'idir',
            company: 'test company',
            regional_offices: [1, 2],
            comments: 'test comment'
          },
          create_date: '2020-04-20'
        }
      ],
      codes,
      () => {}
    );

    await waitFor(() => {
      expect(getByText('test user')).toBeVisible();
      expect(getByText('testusername')).toBeVisible();
      expect(getByText('test company')).toBeVisible();
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('APPROVED')).toBeVisible();
      expect(queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it('shows a table row when the data object is null', async () => {
    const { getByText, getAllByText } = renderContainer(
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
      expect(getAllByText('Not Applicable').length).toEqual(2);
      expect(getByText('April-20-2020')).toBeVisible();
      expect(getByText('PENDING')).toBeVisible();
    });
  });
});
