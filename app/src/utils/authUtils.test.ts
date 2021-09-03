import { IKeycloakWrapper } from 'hooks/useKeycloakWrapper';
import { isAuthenticated } from './authUtils';

describe('isAuthenticated', () => {
  it('returns false when keycloakWrapper is undefined', () => {
    const keycloakWrapper = undefined;

    expect(isAuthenticated(keycloakWrapper)).toBe(false);
  });

  it('returns false when keycloakWrapper.keycloak is undefined', () => {
    const keycloakWrapper = {
      keycloak: undefined
    } as IKeycloakWrapper;

    expect(isAuthenticated(keycloakWrapper)).toBe(false);
  });

  it('returns false when keycloakWrapper.keycloak.authenticated is falsy', () => {
    const keycloakWrapper = {
      keycloak: {
        authenticated: false
      }
    } as IKeycloakWrapper;

    expect(isAuthenticated(keycloakWrapper)).toBe(false);
  });

  it('returns false when keycloakWrapper.hasLoadedAllUserInfo is falsy', () => {
    const keycloakWrapper = {
      hasLoadedAllUserInfo: false
    } as IKeycloakWrapper;

    expect(isAuthenticated(keycloakWrapper)).toBe(false);
  });

  it('returns true when authenticated', () => {
    const keycloakWrapper = {
      hasLoadedAllUserInfo: true,
      keycloak: {
        authenticated: true
      }
    } as IKeycloakWrapper;

    expect(isAuthenticated(keycloakWrapper)).toBe(true);
  });
});
