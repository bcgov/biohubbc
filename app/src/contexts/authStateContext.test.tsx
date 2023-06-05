import Keycloak from 'keycloak-js';
import { getMockAuthState, SystemUserAuthState, UnauthenticatedUserAuthState } from 'test-helpers/auth-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { AuthStateContext } from './authStateContext';

jest.mock('@react-keycloak/web', () => ({
  useKeycloak: jest.fn(() => ({
    initialized: true,
    keycloak: {
      authenticated: false
    } as unknown as Keycloak
  }))
}));

describe('AuthStateContext', () => {
  afterAll(() => {
    cleanup();
  });

  it('renders with default value', async () => {
    const captureAuthStateValue = jest.fn();

    const authState = getMockAuthState({ base: UnauthenticatedUserAuthState });

    render(
      <AuthStateContext.Provider value={authState}>
        <AuthStateContext.Consumer>
          {(value) => {
            captureAuthStateValue(value);
            return <></>;
          }}
        </AuthStateContext.Consumer>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(captureAuthStateValue).toHaveBeenCalledWith({
        ...authState,
        keycloakWrapper: {
          ...authState.keycloakWrapper,
          getIdentitySource: expect.any(Function),
          getUserIdentifier: expect.any(Function),
          getUserGuid: expect.any(Function),
          refresh: expect.any(Function),
          hasSystemRole: expect.any(Function),
          getLoginUrl: expect.any(Function),
          isSystemUser: expect.any(Function)
        }
      });
    });
  });

  it('renders with provided value', () => {
    const captureAuthStateValue = jest.fn();

    const authState = getMockAuthState({ base: SystemUserAuthState });

    render(
      <AuthStateContext.Provider value={authState}>
        <AuthStateContext.Consumer>
          {(value) => {
            captureAuthStateValue(value);
            return <></>;
          }}
        </AuthStateContext.Consumer>
      </AuthStateContext.Provider>
    );

    expect(captureAuthStateValue).toHaveBeenCalledWith(authState);
  });
});
