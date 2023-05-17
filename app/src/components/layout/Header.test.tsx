import { render } from 'test-helpers/test-utils';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import Keycloak from 'keycloak-js';
import React from 'react';
import { Router } from 'react-router-dom';
import Header from './Header';

const history = createMemoryHistory();

describe('Header', () => {
  it('renders correctly with system admin role', () => {
    const mockHasSystemRole = jest.fn();

    mockHasSystemRole
      .mockReturnValueOnce(true) // Return true when the `Projects` secure link is parsed
      .mockReturnValueOnce(true) // Return true when the `Manage Users` secure link is parsed
      .mockReturnValueOnce(true); // Return true when the `Map` secure link is parsed

    const authState: IAuthState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        } as Keycloak,
        isSystemUser: () => true,
        hasLoadedAllUserInfo: true,
        hasOneOrMoreProjectRoles: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.IDIR,
        getUserGuid: () => 'abcd',
        username: 'testusername',
        displayName: 'IDID / testusername',
        email: 'test@email',
        refresh: () => {},
        getLoginUrl: () => '/login'
      }
    };

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Map')).toBeVisible();
    expect(getByText('Manage Users')).toBeVisible();
  });

  it('renders correctly with system admin role', () => {
    const mockHasSystemRole = jest.fn();

    mockHasSystemRole
      .mockReturnValueOnce(true) // Return true when the `Projects` secure link is parsed
      .mockReturnValueOnce(true) // Return true when the `Manage Users` secure link is parsed
      .mockReturnValueOnce(true) // Return true when the `Map` secure link is parsed
      .mockReturnValueOnce(true); // Return true when the `Resources` secure link is parsed

    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        } as Keycloak,
        isSystemUser: () => true,
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasOneOrMoreProjectRoles: true,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
        getUserGuid: () => 'abcd',
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {},
        getLoginUrl: () => '/login'
      }
    };

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Map')).toBeVisible();
    expect(getByText('Manage Users')).toBeVisible();
    expect(getByText('Resources')).toBeVisible();
  });

  it('renders the username and logout button', () => {
    const authState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        } as Keycloak,
        isSystemUser: () => true,
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: () => 'testuser',
        getUserGuid: () => 'abcd',
        hasAccessRequest: false,
        hasOneOrMoreProjectRoles: true,
        hasSystemRole: jest.fn(),
        getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        firstName: 'testfirst',
        lastName: 'testlast',
        refresh: () => {},
        getLoginUrl: () => '/login'
      }
    };

    const { getByTestId, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByTestId('menu_log_out')).toBeVisible();

    expect(getByText('BCeID Basic/testuser')).toBeVisible();
  });

  describe('Log Out', () => {
    it('redirects to the `/logout` page', async () => {
      const authState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          } as Keycloak,
          isSystemUser: () => true,
          hasLoadedAllUserInfo: true,
          hasAccessRequest: false,
          hasOneOrMoreProjectRoles: true,
          systemRoles: [],
          getUserIdentifier: jest.fn(),
          hasSystemRole: jest.fn(),
          getIdentitySource: jest.fn(),
          username: 'testusername',
          displayName: 'testdisplayname',
          getUserGuid: () => 'abcd',
          email: 'test@email.com',
          firstName: 'testfirst',
          lastName: 'testlast',
          refresh: () => {},
          getLoginUrl: () => '/login'
        }
      };

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
