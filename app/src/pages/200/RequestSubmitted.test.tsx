import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { getMockAuthState, SystemAdminAuthState, SystemUserAuthState } from 'test-helpers/auth-helpers';
import { render } from 'test-helpers/test-utils';
import RequestSubmitted from './RequestSubmitted';

describe('RequestSubmitted', () => {
  it.skip('renders a spinner when `hasLoadedAllUserInfo` is false', () => {
    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { keycloakWrapper: { hasLoadedAllUserInfo: false } }
    });

    const history = createMemoryHistory();

    history.push('/access-request');

    const { asFragment } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <RequestSubmitted />
        </Router>
      </AuthStateContext.Provider>
    );

    // does not change location
    expect(history.location.pathname).toEqual('/access-request');

    // renders a spinner
    expect(asFragment()).toMatchSnapshot();
  });

  it.skip('redirects to `/admin/projects` when user has at least 1 system role', () => {
    const authState = getMockAuthState({ base: SystemAdminAuthState });

    const history = createMemoryHistory();

    history.push('/access-request');

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <RequestSubmitted />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(history.location.pathname).toEqual('/admin/projects');
  });

  it('redirects to `/` when user has no pending access request', () => {
    const authState = getMockAuthState({ base: SystemUserAuthState });

    const history = createMemoryHistory();

    history.push('/access-request');

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <RequestSubmitted />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(history.location.pathname).toEqual('/');
  });

  it.skip('renders correctly when user has no role but has a pending access requests', () => {
    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { keycloakWrapper: { hasAccessRequest: true } }
    });

    const history = createMemoryHistory();

    history.push('/access-request');

    const { getByText, asFragment } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <RequestSubmitted />
        </Router>
      </AuthStateContext.Provider>
    );

    // does not change location
    expect(history.location.pathname).toEqual('/access-request');

    expect(getByText('Log Out')).toBeVisible();

    // renders the component in full
    expect(asFragment()).toMatchSnapshot();
  });

  describe('Log Out', () => {
    const history = createMemoryHistory();

    it('should redirect to `/logout`', async () => {
      const authState = getMockAuthState({
        base: SystemUserAuthState,
        overrides: { keycloakWrapper: { hasAccessRequest: true } }
      });

      const { getByTestId } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <RequestSubmitted />
          </Router>
        </AuthStateContext.Provider>
      );

      expect(getByTestId('logout-button')).toHaveAttribute('href', '/logout');
    });
  });
});
