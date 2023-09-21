import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import { Router } from 'react-router-dom';
import { getMockAuthState, SystemAdminAuthState, SystemUserAuthState } from 'test-helpers/auth-helpers';
import { render } from 'test-helpers/test-utils';
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
    expect(getByText('Manage Users')).toBeVisible();
  });

  it('renders correctly with system admin role (BCeID Business)', () => {
    const authState = getMockAuthState({
      base: SystemAdminAuthState,
      overrides: { keycloakWrapper: { getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS } }
    });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Manage Users')).toBeVisible();
  });

  it('renders correctly with system admin role (BCeID Basic)', () => {
    const authState = getMockAuthState({
      base: SystemAdminAuthState,
      overrides: { keycloakWrapper: { getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.BCEID_BASIC } }
    });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Manage Users')).toBeVisible();
  });

  it('renders the username and logout button', () => {
    const authState = getMockAuthState({
      base: SystemAdminAuthState,
      overrides: { keycloakWrapper: { getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.BCEID_BASIC } }
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

  describe('Log Out', () => {
    it('redirects to the `/logout` page', async () => {
      const authState = getMockAuthState({ base: SystemUserAuthState });

      const { getByTestId } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <Header />
          </Router>
        </AuthStateContext.Provider>
      );

      expect(getByTestId('menu_log_out')).toHaveAttribute('href', '/logout');
    });
  });
});
