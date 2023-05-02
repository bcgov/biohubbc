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

    it('renders the sign in CTA', () => {
      const mockHasSystemRole = jest.fn();

      mockHasSystemRole
        .mockReturnValueOnce(true) // Return true when the `Projects` secure link is parsed
        .mockReturnValueOnce(true) // Return true when the `Manage Users` secure link is parsed
        .mockReturnValueOnce(true); // Return true when the `Map` secure link is parsed

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

    });
  });
});
