import { cleanup, fireEvent, cleanup, render, waitFor } from 'test-helpers/test-utils';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import {
  getMockAuthState,
  SystemAdminAuthState,
  SystemUserAuthState,
  UnauthenticatedUserAuthState
} from 'test-helpers/auth-helpers';
import { LandingPage } from './LandingPage';

const history = createMemoryHistory();

describe('LandingPage', () => {
  describe('LandingActions', () => {
    afterEach(() => {
      cleanup();
    });

    it('Case 1: Not signed in', async () => {
      const authState = getMockAuthState({ base: UnauthenticatedUserAuthState });

      const { getByText, getByTestId } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see the BCeID message
      expect(
        getByText('To access this application, you must use a valid government-issued IDIR or BCeID account.')
      ).toBeVisible();

      // Should see the Log in button
      const loginButton = getByTestId('landing_page_login_button');
      expect(loginButton).toBeVisible();
      expect(loginButton).toHaveTextContent('Log In');
      expect(loginButton).toHaveAttribute('href', '/login');
    });

    it('Case 2: Signed in for the first time, no access requests sent', async () => {
      const authState = getMockAuthState({
        base: SystemUserAuthState,
        overrides: { keycloakWrapper: { isSystemUser: () => false } }
      });

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome, <user>" but not "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting');
      expect(greeting).toBeVisible();
      expect(greeting).toHaveTextContent('Welcome, testusername');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see the no-access message
      expect(getByText('You have not been granted permission to access this application.')).toBeVisible();

      // Should see the Request Access button
      const requestAccessButton = getByTestId('landing_page_request_access_button');
      expect(requestAccessButton).toBeVisible();

      // Should go to the request access page
      fireEvent.click(requestAccessButton);
      await waitFor(() => {
        expect(history.location.pathname).toBe('/access-request');
      });
    });

    it('Case 3: Signed in, has sent an access request and is awaiting approval', () => {
      const authState = getMockAuthState({
        base: SystemUserAuthState,
        overrides: { keycloakWrapper: { isSystemUser: () => false, hasAccessRequest: true } }
      });

      const { getByText, getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting');
      expect(greeting).toBeVisible();
      expect(greeting).toHaveTextContent('Welcome back, testusername');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see "your request is pending" message
      expect(getByText('Access request pending')).toBeVisible();
      expect(getByText('Your request is currently pending a review by an administrator.')).toBeVisible();

      // Should see the Logout button
      const logoutButton = getByTestId('menu_log_out');
      expect(logoutButton).toBeVisible();
      expect(logoutButton).toHaveAttribute('href', '/logout');

      // Should not see the Request access button
      expect(queryByText('Request Access')).not.toBeInTheDocument();
    });

    it('Case 4: Signed in, is added as a project participant, but still has a pending access request', () => {
      const authState = getMockAuthState({
        base: SystemUserAuthState,
        overrides: { keycloakWrapper: { hasAccessRequest: true, hasOneOrMoreProjectRoles: true } }
      });

      const { getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting');
      expect(greeting).toBeVisible();
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should not see the Request Access button
      expect(queryByText('Request Access')).not.toBeInTheDocument();

      // Should not see "your request is pending" message
      expect(queryByText('Your access request is currently pending.')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByTestId('landing_page_projects_button');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton).toHaveAttribute('href', '/admin/projects');
    });

    it('Case 5: Signed in, has a viewer role on some project, but not a system role that allows project creation', () => {
      const authState = getMockAuthState({
        base: SystemUserAuthState,
        overrides: { keycloakWrapper: { hasOneOrMoreProjectRoles: true } }
      });

      const { getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting');
      expect(greeting).toBeVisible();
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should not see the Request Access button
      expect(queryByText('Request Access')).not.toBeInTheDocument();

      // Should not see "your request is pending" message
      expect(queryByText('Your access request is currently pending.')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByTestId('landing_page_projects_button');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton).toHaveAttribute('href', '/admin/projects');
    });

    it('Case 6: Signed in, has the ability to view and create projects', () => {
      const authState = getMockAuthState({
        base: SystemUserAuthState,
        overrides: {
          keycloakWrapper: {
            hasOneOrMoreProjectRoles: true,
            hasSystemRole: (systemRoles?: string[]) => Boolean(systemRoles?.includes(SYSTEM_ROLE.PROJECT_CREATOR))
          }
        }
      });

      const { getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting');
      expect(greeting).toBeVisible();
      expect(greeting).toHaveTextContent('Welcome back, testuser');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByTestId('landing_page_projects_button');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton).toHaveAttribute('href', '/admin/projects');

      // Should see the Create Project button
      const createProjectButton = getByTestId('landing_page_create_project_button');
      expect(createProjectButton).toBeVisible();
      expect(createProjectButton).toHaveAttribute('href', '/admin/projects/create');
    });

    it('Case 7: Signed in, has an admin role', () => {
      const authState = getMockAuthState({ base: SystemAdminAuthState });

      const { getByTestId, queryByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      // Should see "Welcome back, <user>"
      const greeting = getByTestId('landing_page_greeting');
      expect(greeting).toBeVisible();
      expect(greeting).toHaveTextContent('Welcome back, admin-username');

      // Should not see the Log In button
      expect(queryByText('Log In')).not.toBeInTheDocument();

      // Should see the View Projects button
      const viewProjectsButton = getByTestId('landing_page_projects_button');
      expect(viewProjectsButton).toBeVisible();
      expect(viewProjectsButton).toHaveAttribute('href', '/admin/projects');

      // Should see the Manage Users button
      const manageUsersButton = getByTestId('landing_page_manage_users_button');
      expect(manageUsersButton).toHaveTextContent('Manage Users');
      expect(manageUsersButton).toBeVisible();
      expect(manageUsersButton).toHaveAttribute('href', '/admin/users');
    });
  });
});
