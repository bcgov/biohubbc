import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { getMockAuthState, SystemAdminAuthState, SystemUserAuthState } from 'test-helpers/auth-helpers';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import Header from './Header';

const history = createMemoryHistory();

describe('Header', () => {
  it('renders correctly with system admin role (IDIR)', () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Admin')).toBeVisible();
    expect(getByText('Standards')).toBeVisible();
  });

  it('renders correctly with system admin role (BCeID Business)', () => {
    const authState = getMockAuthState({
      base: SystemAdminAuthState,
      overrides: { simsUserWrapper: { identitySource: SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS } }
    });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Admin')).toBeVisible();
    expect(getByText('Standards')).toBeVisible();
  });

  it('renders correctly with system admin role (BCeID Basic)', () => {
    const authState = getMockAuthState({
      base: SystemAdminAuthState,
      overrides: { simsUserWrapper: { identitySource: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC } }
    });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Admin')).toBeVisible();
    expect(getByText('Standards')).toBeVisible();
  });

  it('renders the username and logout button', () => {
    const authState = getMockAuthState({
      base: SystemAdminAuthState,
      overrides: { simsUserWrapper: { identitySource: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC } }
    });

    const { getByTestId, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByTestId('menu_log_out')).toBeVisible();

    expect(getByText('BCeID Basic/admin-username')).toBeVisible();
  });

  describe('Log out', () => {
    describe('expanded menu button', () => {
      it('calls logout', async () => {
        const signoutRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: SystemUserAuthState,
          overrides: { auth: { signoutRedirect: signoutRedirectStub } }
        });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <Header />
            </Router>
          </AuthStateContext.Provider>
        );

        const logoutButton = getByTestId('menu_log_out');

        expect(logoutButton).toBeInTheDocument();

        fireEvent.click(logoutButton);

        await waitFor(() => {
          expect(signoutRedirectStub).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('collapsed menu button', () => {
      it('calls logout', async () => {
        const signoutRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: SystemUserAuthState,
          overrides: { auth: { signoutRedirect: signoutRedirectStub } }
        });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <Header />
            </Router>
          </AuthStateContext.Provider>
        );

        const logoutButton = getByTestId('collapsed_menu_log_out');

        expect(logoutButton).toBeInTheDocument();

        fireEvent.click(logoutButton);

        await waitFor(() => {
          expect(signoutRedirectStub).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
