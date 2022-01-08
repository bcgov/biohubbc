import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { useRestorationTrackerApi } from '../../../hooks/useRestorationTrackerApi';
import UsersDetailHeader from './UsersDetailHeader';
import { DialogContextProvider } from 'contexts/dialogContext';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');

const mockuseRestorationTrackerApi = {
  user: {
    deleteSystemUser: jest.fn<Promise<number>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

const mockUser = {
  id: 1,
  user_record_end_date: 'ending',
  user_identifier: 'testUser',
  role_names: ['system']
};

describe('UsersDetailHeader', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly when selectedUser are loaded', async () => {
    history.push('/admin/users/1');

    const { getAllByTestId } = render(
      <Router history={history}>
        <UsersDetailHeader userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('user-detail-title').length).toEqual(1);
      expect(getAllByTestId('remove-user-button').length).toEqual(1);
    });
  });

  it('breadcrumbs link routes user correctly', async () => {
    history.push('/admin/users/1');

    const { getAllByTestId, getByText } = render(
      <Router history={history}>
        <UsersDetailHeader userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('user-detail-title').length).toEqual(1);
    });

    fireEvent.click(getByText('Manage Users'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/users');
    });
  });

  describe('Are you sure? Dialog', () => {
    it('Remove User button opens dialog', async () => {
      history.push('/admin/users/1');

      const { getAllByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailHeader userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByTestId('user-detail-title').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove System User').length).toEqual(1);
      });
    });

    it('does nothing if the user clicks `No` or away from the dialog', async () => {
      history.push('/admin/users/1');

      const { getAllByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailHeader userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByTestId('user-detail-title').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove System User').length).toEqual(1);
      });

      fireEvent.click(getByText('No'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('deletes the user and routes user back to Manage Users page', async () => {
      mockRestorationTrackerApi().user.deleteSystemUser.mockResolvedValue({
        response: 200
      } as any);

      history.push('/admin/users/1');

      const { getAllByTestId, getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailHeader userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByTestId('user-detail-title').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove System User').length).toEqual(1);
      });

      fireEvent.click(getByText('Yes'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users');
      });
    });
  });
});
