import { IAuthState } from 'contexts/authStateContext';
import { KeycloakInstance } from 'keycloak-js';

const SystemUserAuthState: IAuthState = {
  keycloakWrapper: {
    keycloak: ({
      authenticated: true
    } as unknown) as KeycloakInstance,
    hasLoadedAllUserInfo: true,
    systemRoles: [],
    isSystemUser: () => false,
    hasSystemRole: () => false,
    hasAccessRequest: false,
    getUserIdentifier: () => 'testusername',
    getIdentitySource: () => 'idir',
    username: 'testusername',
    display_name: 'testdisplayname',
    email: 'test@email.com',
    refresh: () => {
      // do nothing
    }
  }
};

// Same effect as `Partial` but applies to all levels of a nested object
type Subset<T> = {
  [P in keyof T]?: T[P] extends Record<any, any> | undefined ? Subset<T[P]> : T[P];
};

export const getMockAuthState = (
  overrides?: Subset<IAuthState>,
  base: IAuthState = SystemUserAuthState
): IAuthState => {
  return ({
    ...base,
    ...overrides,
    keycloakWrapper: {
      ...base.keycloakWrapper,
      ...overrides?.keycloakWrapper,
      Keycloak: {
        ...base.keycloakWrapper?.keycloak,
        ...overrides?.keycloakWrapper?.keycloak
      }
    }
  } as unknown) as IAuthState;
};
