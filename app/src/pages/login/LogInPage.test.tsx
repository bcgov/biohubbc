import { render } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import LogInPage from './LogInPage';

const history = createMemoryHistory();

describe('LogInPage', () => {
  it('renders a spinner when user is authenticated and `hasLoadedAllUserInfo` is false', () => {
    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: false,
        systemRoles: [],
        hasAccessRequest: false,

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

    history.push('/login');

    const { asFragment } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <LogInPage />
        </Router>
      </AuthStateContext.Provider>
    );

    // does not change location
    expect(history.location.pathname).toEqual('/login');

    // renders a spinner
    expect(asFragment()).toMatchSnapshot();
  });

  it('redirects to `/request-submitted` when user is authenticated and has a pending access request', () => {
    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [],
        hasAccessRequest: true,

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

    history.push('/login');

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <LogInPage />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(history.location.pathname).toEqual('/request-submitted');
  });

  it('redirects to `/projects` when user is authenticated and has at least 1 system role', () => {
    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        hasAccessRequest: false,

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

    history.push('/login');

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <LogInPage />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(history.location.pathname).toEqual('/projects');
  });

  it('renders correctly when user is not authenticated', () => {
    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: false
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [],
        hasAccessRequest: false,

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

    const { getByText, getByTestId } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <LogInPage />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Welcome to Species Inventory Management System')).toBeVisible();
    expect(getByText('You must log in to access this application.')).toBeVisible();
    expect(getByTestId('login')).toBeVisible();
  });
});
