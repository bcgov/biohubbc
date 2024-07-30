import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { Router } from 'react-router';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { Mock } from 'vitest';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import UsersDetailHeader from './UsersDetailHeader';

const history = createMemoryHistory();

vi.mock('../../../hooks/useBioHubApi');

const mockBiohubApi = useBiohubApi as Mock;

const mockUseApi = {
  user: {
    deleteSystemUser: vi.fn()
  }
};

const mockUser: ISystemUser = {
  system_user_id: 1,
  record_end_date: 'ending',
  user_guid: '123',
  user_identifier: 'testUser',
  role_names: ['system'],
  identity_source: 'idir',
  role_ids: [],
  email: '',
  display_name: '',
  agency: ''
};

describe('UsersDetailHeader', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
  });

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
      expect(getAllByTestId('remove-user-button').length).toEqual(1);
    });
  });

  describe('Are you sure? Dialog', () => {
    it('Remove User button opens dialog', async () => {
      history.push('/admin/users/1');

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailHeader userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove system user?').length).toEqual(1);
      });
    });

    it('does nothing if the user clicks `Cancel` or away from the dialog', async () => {
      history.push('/admin/users/1');

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailHeader userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove system user?').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('deletes the user and routes user back to Manage Users page', async () => {
      mockUseApi.user.deleteSystemUser.mockResolvedValue({
        response: 200
      } as any);

      history.push('/admin/users/1');

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailHeader userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Remove system user?').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users');
      });
    });
  });
});
