import { cleanup, render } from '@testing-library/react';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import Keycloak from 'keycloak-js';
import React from 'react';
import { Router } from 'react-router-dom';
import LoginPage from './LoginPage';

const history = createMemoryHistory();

describe('LoginPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('Should call keycloak login', async () => {
    const mockLoginFunction = jest.fn();

    const authState: IAuthState = {
      keycloakWrapper: {
        keycloak: {
          authenticated: false,
          login: () => {
            mockLoginFunction();
          }
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
        refresh: () => {},
        getLoginUrl: () => '/my-test-login'
      }
    };

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <LoginPage />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(mockLoginFunction).toBeCalled();
  });
});
