import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { getMockAuthState, SystemUserAuthState, UnauthenticatedUserAuthState } from 'test-helpers/auth-helpers';
import { fireEvent, render } from 'test-helpers/test-utils';
import AccessDenied from './AccessDenied';

const history = createMemoryHistory();

describe('AccessDenied', () => {
  it.skip('redirects to `/` when user is not authenticated', () => {
    const authState = getMockAuthState({ base: UnauthenticatedUserAuthState });

    const history = createMemoryHistory();

    history.push('/forbidden');

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(history.location.pathname).toEqual('/forbidden');
  });

  it.skip('renders a spinner when user is authenticated and `hasLoadedAllUserInfo` is false', () => {
    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { keycloakWrapper: { hasLoadedAllUserInfo: false } }
    });

    const history = createMemoryHistory();

    history.push('/forbidden');

    const { asFragment } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    // does not change location
    expect(history.location.pathname).toEqual('/forbidden');

    // renders a spinner
    expect(asFragment()).toMatchSnapshot();
  });

  it('redirects to `/request-submitted` when user is authenticated and has a pending access request', () => {
    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { keycloakWrapper: { hasAccessRequest: true } }
    });

    const history = createMemoryHistory();

    history.push('/forbidden');

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(history.location.pathname).toEqual('/request-submitted');
  });

  it('renders correctly when the user is authenticated and has no pending access requests', () => {
    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { keycloakWrapper: { systemRoles: [SYSTEM_ROLE.PROJECT_CREATOR] } }
    });

    const { getByText, queryByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('You do not have permission to access this page.')).toBeVisible();
    expect(queryByTestId('request_access')).not.toBeInTheDocument();
  });

  it('redirects to `/access-request` when the `Request Access` button clicked', () => {
    const authState = getMockAuthState({ base: SystemUserAuthState });

    const { getByText, getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('You do not have permission to access this page.')).toBeVisible();
    expect(getByTestId('request_access')).toBeVisible();

    fireEvent.click(getByText('Request Access'));

    expect(history.location.pathname).toEqual('/access-request');
  });
});
