import { cleanup, render, waitFor } from "@testing-library/react";
// import { SYSTEM_ROLE } from "constants/roles";
import { AuthStateContext, IAuthState } from "contexts/authStateContext";
// import { SYSTEM_IDENTITY_SOURCE } from "hooks/useKeycloakWrapper";
import { createMemoryHistory } from 'history';
import Keycloak from "keycloak-js";
import React from 'react';
import { Router } from 'react-router-dom';
import { LandingPage } from "./LandingPage";
import { fireEvent } from "@testing-library/react";
import { SYSTEM_ROLE } from "constants/roles";

//import { useBiohubApi } from "hooks/useBioHubApi";

//jest.mock('../../hooks/useBioHubApi');

/*
const mockUseBiohubApi = {
  project: {
    getProjectsList: jest.fn()
  },
  draft: {
    getDraftsList: jest.fn()
  },
  codes: {
    getAllCodeSets: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);
*/

const history = createMemoryHistory();

describe('LandingPage', () => {
  describe('LandingActions', () => {
    beforeEach(() => {
      //mockBiohubApi().project.getProjectsList.mockClear();
      //mockBiohubApi().draft.getDraftsList.mockClear();
    });

    afterEach(() => {
      cleanup();
    });

    it('Case 1: Not signed in', async () => {
      const authState: IAuthState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: false
          } as Keycloak,
          isSystemUser: () => false,
          hasLoadedAllUserInfo: false,
          hasOneOrMoreProjectRoles: false,
          systemRoles: [],
          getUserIdentifier: () => null,
          hasAccessRequest: false,
          hasSystemRole: () => false,
          getIdentitySource: () => null,
          getUserGuid: () => null,
          username: undefined,
          displayName: undefined,
          email: undefined,
          refresh: () => { },
          getLoginUrl: () => '/my-test-login'
        }
      };

      const { getByText, getByTestId } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see the BCeID message
      expect(getByText('To access this application, you must use a valid BC government-issued IDIR or BCeID account credential.'))
        .toBeVisible();

      // Should see the Log in button
      const loginButton = getByTestId('landing_page_login_button');
      expect(loginButton).toBeVisible();
      expect(loginButton).toHaveTextContent('Log In');
      expect(loginButton).toHaveAttribute('href', '/my-test-login');
    });

    it('Case 2: Signed in for the first time, no access requests sent', async () => {
      const authState: IAuthState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          } as Keycloak,
          isSystemUser: () => false,
          hasLoadedAllUserInfo: true,
          hasOneOrMoreProjectRoles: false,
          systemRoles: [],
          getUserIdentifier: () => 'testuser',
          hasAccessRequest: false,
          hasSystemRole: () => false,
          getIdentitySource: () => null,
          getUserGuid: () => 'testuserguid',
          username: 'testuser',
          displayName: 'Test User',
          email: 'testuser@example.com',
          refresh: () => { },
          getLoginUrl: () => '/test-1-login-endpoint'
        }
      };

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome, <user>" but not "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting')
      expect(greeting).toBeVisible(); 
      expect(greeting).toHaveTextContent('Welcome, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see the no-access message
      expect(getByText('You have not been granted permission to access this application.')).toBeVisible();

      // Should see the Request Access button
      const requestAccessButton = getByText('Request Access');
      expect(requestAccessButton).toBeVisible();
      
      // Should go to the request access page
      fireEvent.click(requestAccessButton);
      await waitFor(() => {
        expect(history.location.pathname).toBe('/access-request');
      });
    });

    it('Case 3: Signed in, has sent an access request and is awaiting approval', () => {
      const authState: IAuthState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          } as Keycloak,
          isSystemUser: () => false,
          hasLoadedAllUserInfo: true,
          hasOneOrMoreProjectRoles: false,
          systemRoles: [],
          getUserIdentifier: () => 'testuser',
          hasAccessRequest: true,
          hasSystemRole: () => false,
          getIdentitySource: () => null,
          getUserGuid: () => 'testuserguid',
          username: 'testuser',
          displayName: 'Test User',
          email: 'testuser@example.com',
          refresh: () => { },
          getLoginUrl: () => '/test-1-login-endpoint'
        }
      };

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting')
      expect(greeting).toBeVisible(); 
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see "your request is pending" message
      expect(getByText('Access request pending')).toBeVisible();
      expect(getByText('You access request for this application is currently under review. You will be notified by email when your request has been reviewed.')).toBeVisible();

      // Should see the Logout button
      const logoutButton = getByText('Log Out');
      expect(logoutButton).toBeVisible();
      expect(logoutButton).toHaveAttribute('href', '/logout');

      // Should not see the Request access button
      expect(queryByText('Request Access')).not.toBeInTheDocument();
    });

    it('Case 4: Signed in, is added as a project participant, but still has a pending access request', () => {
      const authState: IAuthState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          } as Keycloak,
          isSystemUser: () => true,
          hasLoadedAllUserInfo: true,
          hasOneOrMoreProjectRoles: true,
          systemRoles: [],
          getUserIdentifier: () => 'testuser',
          hasAccessRequest: true,
          hasSystemRole: () => false,
          getIdentitySource: () => null,
          getUserGuid: () => 'testuserguid',
          username: 'testuser',
          displayName: 'Test User',
          email: 'testuser@example.com',
          refresh: () => { },
          getLoginUrl: () => '/test-1-login-endpoint'
        }
      };

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting')
      expect(greeting).toBeVisible(); 
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should not see the Request Access button
      expect(queryByText('Request Access')).not.toBeInTheDocument();

      // Should not see "your request is pending" message
      expect(queryByText('Your access request is currently pending.')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByText('View Projects');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton.parentElement).toHaveAttribute('href', '/admin/projects');
    });

    it('Case 5: Signed in, has a viewer role on some project, but not a system role that allows project creation', () => {
      const authState: IAuthState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          } as Keycloak,
          isSystemUser: () => true,
          hasLoadedAllUserInfo: true,
          hasOneOrMoreProjectRoles: true,
          systemRoles: [],
          getUserIdentifier: () => 'testuser',
          hasAccessRequest: false,
          hasSystemRole: () => false,
          getIdentitySource: () => null,
          getUserGuid: () => 'testuserguid',
          username: 'testuser',
          displayName: 'Test User',
          email: 'testuser@example.com',
          refresh: () => { },
          getLoginUrl: () => '/test-1-login-endpoint'
        }
      };

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting')
      expect(greeting).toBeVisible(); 
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should not see the Request Access button
      expect(queryByText('Request Access')).not.toBeInTheDocument();

      // Should not see "your request is pending" message
      expect(queryByText('Your access request is currently pending.')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByText('View Projects');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton.parentElement).toHaveAttribute('href', '/admin/projects');
    });

    it('Case 6: Signed in, has the ability to view and create projects', () => {
      const authState: IAuthState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          } as Keycloak,
          isSystemUser: () => true,
          hasLoadedAllUserInfo: true,
          hasOneOrMoreProjectRoles: true,
          systemRoles: [],
          getUserIdentifier: () => 'testuser',
          hasAccessRequest: false,
          hasSystemRole: (systemRoles) => Boolean(systemRoles?.includes(SYSTEM_ROLE.PROJECT_CREATOR)),
          getIdentitySource: () => null,
          getUserGuid: () => 'testuserguid',
          username: 'testuser',
          displayName: 'Test User',
          email: 'testuser@example.com',
          refresh: () => { },
          getLoginUrl: () => '/test-1-login-endpoint'
        }
      };

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting')
      expect(greeting).toBeVisible(); 
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByText('View Projects');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton.parentElement).toHaveAttribute('href', '/admin/projects');

      // Should see the Create Project button
      const createProjectButton = getByText('Create a Project');
      expect(createProjectButton).toBeVisible();
      expect(createProjectButton.parentElement).toHaveAttribute('href', '/admin/projects/create');
    });

    it('Case 7: Signed in, has an admin role', () => {
      const authState: IAuthState = {
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          } as Keycloak,
          isSystemUser: () => true,
          hasLoadedAllUserInfo: true,
          hasOneOrMoreProjectRoles: true,
          systemRoles: [],
          getUserIdentifier: () => 'testuser',
          hasAccessRequest: false,
          hasSystemRole: (systemRoles) => Boolean(systemRoles?.includes(SYSTEM_ROLE.SYSTEM_ADMIN)),
          getIdentitySource: () => null,
          getUserGuid: () => 'testuserguid',
          username: 'testuser',
          displayName: 'Test User',
          email: 'testuser@example.com',
          refresh: () => { },
          getLoginUrl: () => '/test-1-login-endpoint'
        }
      };

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting')
      expect(greeting).toBeVisible(); 
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByText('View Projects');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton.parentElement).toHaveAttribute('href', '/admin/projects');

      // Should see the Manage Users button
      const manageUsersButton = getByTestId('landing_page_manage_users_button');
      expect(manageUsersButton).toHaveTextContent('Manage Users');
      expect(manageUsersButton).toBeVisible();
      expect(manageUsersButton).toHaveAttribute('href', '/admin/users');


    });
  });
});
