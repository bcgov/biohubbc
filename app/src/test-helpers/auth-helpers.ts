import { SYSTEM_ROLE } from 'constants/roles';
import { IAuthState } from 'contexts/authStateContext';
import Keycloak from 'keycloak-js';

export const SystemUserAuthState: IAuthState = {
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
    refresh: () => {
      // do nothing
    }
  }
};

export const SystemAdminAuthState: IAuthState = {
  keycloakWrapper: {
    keycloak: ({
      authenticated: true
    } as unknown) as Keycloak,
    hasLoadedAllUserInfo: true,
    systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
    isSystemUser: () => true,
    hasSystemRole: () => true,
    hasAccessRequest: false,
    getUserIdentifier: () => 'admin-username',
    getIdentitySource: () => 'idir',
    getUserGuid: () => '123-456-789',
    username: 'admin-username',
    displayName: 'admin-displayname',
    email: 'admin@email.com',
    refresh: () => {
      // do nothing
    }
  }
};

// Same effect as `Partial` but applies to all levels of a nested object
type Subset<T> = {
  [P in keyof T]?: T[P] extends Record<any, any> | undefined ? Subset<T[P]> : T[P];
};

/**
 * Build and return a mock auth state object.
 *
 * @param {{ base: IAuthState; overrides?: Subset<IAuthState> }} options
 * @return {*}  {IAuthState}
 */
export const getMockAuthState = (options: { base: IAuthState; overrides?: Subset<IAuthState> }): IAuthState => {
  const { base, overrides } = options;

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
