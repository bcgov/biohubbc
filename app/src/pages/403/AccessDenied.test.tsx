import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { getMockAuthState, SystemUserAuthState, UnauthenticatedUserAuthState } from 'test-helpers/auth-helpers';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { buildUrl } from 'utils/Utils';
import AccessDenied from './AccessDenied';

const history = createMemoryHistory();

describe('AccessDenied', () => {
  it('renders correctly when the user is authenticated and has no pending access requests', () => {
    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { simsUserWrapper: { roleNames: [SYSTEM_ROLE.PROJECT_CREATOR] } }
    });

    const { getByText, queryByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('You do not have permission to access this page.')).toBeVisible();
    expect(queryByTestId('access_denied_request_access_button')).not.toBeInTheDocument();
  });

  it('redirects to `/request-submitted` when user is authenticated and has a pending access request', () => {
    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { simsUserWrapper: { hasAccessRequest: true } }
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

  it('redirects to `/access-request` when user is authenticated, has no access request, and has no role', () => {
    const authState = getMockAuthState({ base: UnauthenticatedUserAuthState });

    const history = createMemoryHistory();

    history.push('/forbidden');

    const { getByText, getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    const requestAccessButton = getByTestId('access_denied_request_access_button');

    expect(getByText('You do not have permission to access this page.')).toBeVisible();
    expect(requestAccessButton).toBeVisible();

    fireEvent.click(requestAccessButton);

    waitFor(() => {
      expect(history.location.pathname).toEqual('/access-request');
    });
  });

  it('redirects to `/access-request` when the `Request Access` button clicked', () => {
    const signinRedirectStub = vi.fn();

    const authState = getMockAuthState({
      base: SystemUserAuthState,
      overrides: { auth: { signinRedirect: signinRedirectStub } }
    });

    const { getByText, getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <AccessDenied />
        </Router>
      </AuthStateContext.Provider>
    );

    const requestAccessButton = getByTestId('access_denied_request_access_button');

    expect(getByText('You do not have permission to access this page.')).toBeVisible();
    expect(requestAccessButton).toBeVisible();

    fireEvent.click(requestAccessButton);

    waitFor(() => {
      expect(signinRedirectStub).toHaveBeenCalledWith({
        redirect_uri: buildUrl(window.location.origin, '/access-request')
      });
    });
  });
});
