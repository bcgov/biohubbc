import { render, screen } from '@testing-library/react';
import Keycloak from 'keycloak-js';
import React from 'react';
import { keycloakWrapper } from 'test-helpers/auth-helpers';
import { AuthStateContext, AuthStateContextProvider } from './authStateContext';

describe('AuthStateContext', () => {
  it('renders with default value', () => {
    render(
      <AuthStateContextProvider>
        <AuthStateContext.Consumer>
          {(value) => <div data-testid="context-value">{JSON.stringify(value)}</div>}
        </AuthStateContext.Consumer>
      </AuthStateContextProvider>
    );

    const contextValue = screen.getByTestId('context-value');

    expect(contextValue).toHaveTextContent(
      JSON.stringify({
        keycloakWrapper: {
          hasLoadedAllUserInfo: false,
          systemRoles: [],
          hasAccessRequest: false
        }
      })
    );
  });

  it('renders with provided value', () => {
    const testKeycloakWrapper = { ...keycloakWrapper };

    render(
      <AuthStateContext.Provider value={{ keycloakWrapper: testKeycloakWrapper }}>
        <AuthStateContext.Consumer>
          {(value) => <div data-testid="context-value">{JSON.stringify(value)}</div>}
        </AuthStateContext.Consumer>
      </AuthStateContext.Provider>
    );

    const contextValue = screen.getByTestId('context-value');

    expect(contextValue).toHaveTextContent(
      JSON.stringify({
        keycloakWrapper: {
          keycloak: ({
            authenticated: true
          } as unknown) as Keycloak,
          hasLoadedAllUserInfo: true,
          systemRoles: [],
          isSystemUser: () => false,
          hasSystemRole: () => false,
          hasAccessRequest: false,
          getUserIdentifier: () => 'testusername',
          getIdentitySource: () => 'idir',
          getUserGuid: () => 'aaaa',
          username: 'testusername',
          displayName: 'testdisplayname',
          email: 'test@email.com',
          refresh: () => {},
          getLoginUrl: () => '/login'
        }
      })
    );
  });
});
