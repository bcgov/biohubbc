import { SYSTEM_ROLE } from 'constants/roles';
import { IAuthState } from 'contexts/authStateContext';
import Keycloak from 'keycloak-js';

/**
 * Represents an unauthenticated user who has:
 *  - not yet successfully authenticated (all keycloak details about the user will be false, null, or undefined)
 */
export const UnauthenticatedUserAuthState: IAuthState = {
  keycloakWrapper: {
    keycloak: {
      authenticated: false
    } as unknown as Keycloak,
    hasLoadedAllUserInfo: false,
    systemRoles: [],
    isSystemUser: () => false,
    hasSystemRole: () => false,
    hasAccessRequest: false,
    hasOneOrMoreProjectRoles: false,
    getUserIdentifier: () => null,
    getIdentitySource: () => null,
    getUserGuid: () => null,
    username: undefined,
    displayName: undefined,
    email: undefined,
    systemUserId: undefined,
    user: undefined,
    refresh: () => {
      // do nothing
    },
    getLoginUrl: () => '/login',
    critterbaseUuid: () => undefined
  }
};

/**
 * Represents an IDIR user who has:
 *  - successfully authenticated
 *  - has already been granted system access (has no pending access request)
 *  - has had all user info loaded successfully
 *  - has no system or project level roles
 */
export const SystemUserAuthState: IAuthState = {
  keycloakWrapper: {
    keycloak: {
      authenticated: true
    } as unknown as Keycloak,
    hasLoadedAllUserInfo: true,
    systemRoles: [],
    isSystemUser: () => true,
    hasSystemRole: () => false,
    hasAccessRequest: false,
    hasOneOrMoreProjectRoles: false,
    getUserIdentifier: () => 'testusername',
    getIdentitySource: () => 'idir',
    getUserGuid: () => '987-654-321',
    username: 'testusername',
    displayName: 'testdisplayname',
    email: 'test@email.com',
    systemUserId: 1,
    user: undefined,
    refresh: () => {
      // do nothing
    },
    getLoginUrl: () => '/login',
    critterbaseUuid: () => 'fakeguid'
  }
};

/**
 * Represents an IDIR user who has:
 *  - successfully authenticated
 *  - has already been granted system access (has no pending access request)
 *  - has had all user info loaded successfully
 *  - has the `System Administrator` system level role
 */
export const SystemAdminAuthState: IAuthState = {
  keycloakWrapper: {
    keycloak: {
      authenticated: true
    } as unknown as Keycloak,
    hasLoadedAllUserInfo: true,
    systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
    isSystemUser: () => true,
    hasSystemRole: () => true,
    hasAccessRequest: false,
    hasOneOrMoreProjectRoles: false,
    getUserIdentifier: () => 'admin-username',
    getIdentitySource: () => 'idir',
    getUserGuid: () => '123-456-789',
    username: 'admin-username',
    displayName: 'admin-displayname',
    email: 'admin@email.com',
    systemUserId: 1,
    user: undefined,
    refresh: () => {
      // do nothing
    },
    getLoginUrl: () => '/login',
    critterbaseUuid: () => 'fakeguid'
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

  return {
    ...base,
    ...overrides,
    keycloakWrapper: {
      ...base.keycloakWrapper,
      ...overrides?.keycloakWrapper,
      keycloak: {
        ...base.keycloakWrapper?.keycloak,
        ...overrides?.keycloakWrapper?.keycloak
      }
    }
  } as unknown as IAuthState;
};
