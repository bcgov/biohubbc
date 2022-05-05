import { fireEvent, render, waitFor } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import RequestSubmitted from './RequestSubmitted';

describe('RequestSubmitted', () => {
  it('renders a spinner when `hasLoadedAllUserInfo` is false', () => {
    const authState = {
      keycloakWrapper: {
        hasLoadedAllUserInfo: false,
        systemRoles: [],
        hasAccessRequest: false,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {}
      }
    };

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

  it('redirects to `/admin/projects` when user has at least 1 system role', () => {
    const authState = {
      keycloakWrapper: {
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
        hasAccessRequest: false,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {}
      }
    };

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
    const authState = {
      keycloakWrapper: {
        hasLoadedAllUserInfo: true,
        systemRoles: [],
        hasAccessRequest: false,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {}
      }
    };

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

  it('renders correctly when user has no role but has a pending access requests', () => {
    const authState = {
      keycloakWrapper: {
        hasLoadedAllUserInfo: true,
        systemRoles: [],
        hasAccessRequest: true,

        keycloak: {},
        getUserIdentifier: jest.fn(),
        hasSystemRole: jest.fn(),
        getIdentitySource: jest.fn(),
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {}
      }
    };

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
      const authState = {
        keycloakWrapper: {
          hasLoadedAllUserInfo: true,
          systemRoles: [],
          hasAccessRequest: true,

          keycloak: {},
          getUserIdentifier: jest.fn(),
          hasSystemRole: jest.fn(),
          getIdentitySource: jest.fn(),
          username: 'testusername',
          displayName: 'testdisplayname',
          email: 'test@email.com',
          firstName: 'testfirst',
          lastName: 'testlast',
          refresh: () => {}
        }
      };

      const { getByTestId } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <RequestSubmitted />
          </Router>
        </AuthStateContext.Provider>
      );

      fireEvent.click(getByTestId('logout-button'));

      waitFor(() => {
        expect(history.location.pathname).toEqual('/logout');
      });
    });
  });
});
