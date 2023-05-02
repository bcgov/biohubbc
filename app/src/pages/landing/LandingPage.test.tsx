import { cleanup, render } from "@testing-library/react";
// import { SYSTEM_ROLE } from "constants/roles";
import { AuthStateContext, IAuthState } from "contexts/authStateContext";
// import { SYSTEM_IDENTITY_SOURCE } from "hooks/useKeycloakWrapper";
import { createMemoryHistory } from 'history';
import Keycloak from "keycloak-js";
import React from 'react';
import { Router } from 'react-router-dom';
import { LandingPage } from "./LandingPage";

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

    it('Case 1: Not signed in', () => {
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
          getLoginUrl: () => '/test-1-login-endpoint'
        }
      };

      const { getByText } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <LandingPage />
          </Router>
        </AuthStateContext.Provider>
      );

      expect(getByText('Log In')).toBeVisible();
      

      // Should see the Log in button

      // Should see the BCeID message
    });

    it('Case 2: Signed in for the first time, no access requests sent', () => {


      // Should see "Welcome, <user>" but not "Welcome back, <user>"
      // Should see the no-access message
      // Should see the Request Access button
    });

    it('Case 3: Signed in, has sent an access request and is awaiting approval', () => {
      // Should see "Welcome back, <user>"
      // Should see "your request is pending" message
      // Should see the Log out button
    });

    it('Case 4: Signed in, is added as a project participant, but still has a pending access request', () => {
      // Should see "Welcome back, <user>"
      // Should see "View Projects" button
    });

    it('Case 5: Signed in, has a viewer role on some project, but not a system role that allows project creation', () => {
      // Should see "Welcome back, <user>"
      // Should see "View Projects" button
    });

    it('Case 6: Signed in, has the ability to view and create projects', () => {
      // Should see "Welcome back, <user>"
      // Should see "View Projects" button
      // Should see "Create a Project" button
    });

    it('Case 7: Signed in, has a system admin role', () => {
      // Should see "Welcome back, <user>"
      // Should see "View Projects" button
      // Should see "Manage Users" button
    });

    it('Case 8: Signed in, has a data admin role', () => {
      // Should see "Welcome back, <user>"
      // Should see "View Projects" button
      // Should see "Manage Users" button
    });
  });
});
