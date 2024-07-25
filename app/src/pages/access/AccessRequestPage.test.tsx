import { ThemeProvider } from '@mui/material/styles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { cleanup, fireEvent, render, waitFor, within } from 'test-helpers/test-utils';
import appTheme from 'themes/appTheme';
import AccessRequestPage from './AccessRequestPage';

const history = createMemoryHistory();

jest.mock('../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  admin: {
    createAdministrativeActivity: jest.fn()
  }
};

const renderContainer = () => {
  const authState = getMockAuthState({ base: SystemAdminAuthState });

  return render(
    <ThemeProvider theme={appTheme}>
      <AuthStateContext.Provider value={authState}>
        <DialogContextProvider>
          <Router history={history}>
            <AccessRequestPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    </ThemeProvider>
  );
};

describe('AccessRequestPage', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.admin.createAdministrativeActivity.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Log Out', () => {
    const history = createMemoryHistory();

    it('should call the auth signoutRedirect function', async () => {
      const signoutRedirectStub = jest.fn();

      const authState = getMockAuthState({
        base: SystemAdminAuthState,
        overrides: { auth: { signoutRedirect: signoutRedirectStub } }
      });

      const { getByTestId } = render(
        <ThemeProvider theme={appTheme}>
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AccessRequestPage />
            </Router>
          </AuthStateContext.Provider>
        </ThemeProvider>
      );

      const logoutButton = getByTestId('access-request-logout-button');

      await waitFor(() => {
        expect(logoutButton).toBeVisible();
      });

      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(signoutRedirectStub).toHaveBeenCalledTimes(1);
      });
    });
  });

  it.skip('processes a successful request submission', async () => {
    mockUseApi.admin.createAdministrativeActivity.mockResolvedValue({
      id: 1
    });

    const { getByText, getAllByRole, getByRole } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/request-submitted');
    });
  });

  it.skip('takes the user to the request-submitted page immediately if they already have an access request', async () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    render(
      <ThemeProvider theme={appTheme}>
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <AccessRequestPage />
          </Router>
        </AuthStateContext.Provider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/request-submitted');
    });
  });

  it.skip('shows error dialog with api error message when submission fails', async () => {
    mockUseApi.admin.createAdministrativeActivity = jest.fn(() => Promise.reject(new Error('API Error is Here')));

    const { getByText, getAllByRole, getByRole, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Ok'));

    await waitFor(() => {
      expect(queryByText('API Error is Here')).toBeNull();
    });
  });

  it.skip('shows error dialog with default error message when response from createAdministrativeActivity is invalid', async () => {
    mockUseApi.admin.createAdministrativeActivity.mockResolvedValue({
      id: null
    });

    const { getByText, getAllByRole, getByRole, queryByText } = renderContainer();

    fireEvent.mouseDown(getAllByRole('button')[0]);

    const systemRoleListbox = within(getByRole('listbox'));

    await waitFor(() => {
      expect(systemRoleListbox.getByText('Creator')).toBeInTheDocument();
    });

    fireEvent.click(systemRoleListbox.getByText('Creator'));

    fireEvent.click(getByText('Submit Request'));

    await waitFor(() => {
      expect(queryByText('The response from the server was null.')).toBeInTheDocument();
    });

    // Get the backdrop, then get the firstChild because this is where the event listener is attached
    //@ts-ignore
    fireEvent.click(getAllByRole('presentation')[0].firstChild);

    await waitFor(() => {
      expect(queryByText('The response from the server was null.')).toBeNull();
    });
  });
});
