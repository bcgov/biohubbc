import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { SYSTEM_ROLE } from 'constants/roles';
import { IAuthState } from 'contexts/authStateContext';
import { AuthContextProps } from 'react-oidc-context';

/**
 * Represents an unauthenticated user who has:
 *  - not yet successfully authenticated (all keycloak details about the user will be false, null, or undefined)
 */
export const UnauthenticatedUserAuthState: IAuthState = {
  isReady: true,
  auth: {
    isLoading: false,
    isAuthenticated: false,
    signoutRedirect: () => {
      // do nothing
    },
    signinRedirect: () => {
      // do nothing
    }
  } as unknown as AuthContextProps,
  simsUserWrapper: {
    isReady: true,
    systemUserId: undefined,
    userGuid: null,
    userIdentifier: undefined,
    displayName: undefined,
    email: undefined,
    agency: undefined,
    roleNames: [],
    identitySource: null,
    hasAccessRequest: false,
    hasOneOrMoreProjectRoles: false,
    hasSystemRole: () => false,
    refresh: () => {
      // do nothing
    }
  },
  critterbaseUserWrapper: {
    isReady: true,
    critterbaseUserUuid: 'fakeguid'
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
  isReady: true,
  auth: {
    isLoading: false,
    isAuthenticated: true,
    signoutRedirect: () => {
      // do nothing
    },
    signinRedirect: () => {
      // do nothing
    }
  } as unknown as AuthContextProps,
  simsUserWrapper: {
    isReady: true,
    systemUserId: 1,
    userGuid: '987-654-321',
    userIdentifier: 'testusername',
    displayName: 'testdisplayname',
    email: 'test@email.com',
    agency: 'agency',
    roleNames: [],
    identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
    hasAccessRequest: false,
    hasOneOrMoreProjectRoles: false,
    hasSystemRole: () => false,
    refresh: () => {
      // do nothing
    }
  },
  critterbaseUserWrapper: {
    isReady: true,
    critterbaseUserUuid: 'fakeguid'
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
  isReady: true,
  auth: {
    isLoading: false,
    isAuthenticated: true,
    signoutRedirect: () => {
      // do nothing
    },
    signinRedirect: () => {
      // do nothing
    }
  } as unknown as AuthContextProps,
  simsUserWrapper: {
    isReady: true,
    systemUserId: 1,
    userGuid: '123-456-789',
    userIdentifier: 'admin-username',
    displayName: 'admin-displayname',
    email: 'admin@email.com',
    agency: 'agency',
    roleNames: [SYSTEM_ROLE.SYSTEM_ADMIN],
    identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
    hasAccessRequest: false,
    hasOneOrMoreProjectRoles: false,
    hasSystemRole: () => true,
    refresh: () => {
      // do nothing
    }
  },
  critterbaseUserWrapper: {
    isReady: true,
    critterbaseUserUuid: 'fakeguid'
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
    auth: {
      ...base.auth,
      ...overrides?.auth
    },
    simsUserWrapper: {
      ...base.simsUserWrapper,
      ...overrides?.simsUserWrapper
    },
    critterbaseUserWrapper: {
      ...base.simsUserWrapper,
      ...overrides?.critterbaseUserWrapper
    }
  } as unknown as IAuthState;
};
