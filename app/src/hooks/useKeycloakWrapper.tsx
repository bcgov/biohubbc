import { useKeycloak } from '@react-keycloak/web';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import Keycloak from 'keycloak-js';
import { useCallback } from 'react';
import { buildUrl } from 'utils/Utils';
import { useBiohubApi } from './useBioHubApi';
import { useCritterbaseApi } from './useCritterbaseApi';
import useDataLoader from './useDataLoader';

export enum SYSTEM_IDENTITY_SOURCE {
  BCEID_BUSINESS = 'BCEIDBUSINESS',
  BCEID_BASIC = 'BCEIDBASIC',
  IDIR = 'IDIR',
  DATABASE = 'DATABASE',
  UNVERIFIED = 'UNVERIFIED'
}

export interface IUserInfo {
  sub: string;
  email_verified: boolean;
  preferred_username: string;
  identity_source: string;
  display_name: string;
  email: string;
}

export interface IIDIRUserInfo extends IUserInfo {
  idir_user_guid: string;
  idir_username: string;
  name: string;
  given_name: string;
  family_name: string;
}

interface IBCEIDBasicUserInfo extends IUserInfo {
  bceid_user_guid: string;
  bceid_username: string;
}

export interface IBCEIDBusinessUserInfo extends IBCEIDBasicUserInfo {
  bceid_business_guid: string;
  bceid_business_name: string;
}

/**
 * Interface defining the objects and helper functions returned by `useKeycloakWrapper`
 *
 * @export
 * @interface IKeycloakWrapper
 */
export interface IKeycloakWrapper {
  /**
   * Original raw keycloak object.
   *
   * @type {(Keycloak)}
   * @memberof IKeycloakWrapper
   */
  keycloak: Keycloak;
  /**
   * Returns `true` if the user's information has finished being loaded, false otherwise.
   *
   * @type {boolean}
   * @memberof IKeycloakWrapper
   */
  hasLoadedAllUserInfo: boolean;
  /**
   * The user's system roles, if any.
   *
   * @type {string[]}
   * @memberof IKeycloakWrapper
   */
  systemRoles: string[];
  /**
   * Returns `true` if the keycloak user is a registered system user, `false` otherwise.
   *
   * @memberof IKeycloakWrapper
   */
  isSystemUser: () => boolean;
  /**
   * Returns `true` if the user's `systemRoles` contain at least 1 of the specified `validSystemRoles`, `false` otherwise.
   *
   * @memberof IKeycloakWrapper
   */
  hasSystemRole: (validSystemRoles?: string[]) => boolean;
  /**
   * True if the user has at least 1 pending access request.
   *
   * @type {boolean}
   * @memberof IKeycloakWrapper
   */
  hasAccessRequest: boolean;
  /**
   * True if the user has at least 1 project participant roles.
   *
   * @type {boolean}
   * @memberof IKeycloakWrapper
   */
  hasOneOrMoreProjectRoles: boolean;
  /**
   * Get out the username portion of the preferred_username from the token.
   *
   * @memberof IKeycloakWrapper
   */
  getUserIdentifier: () => string | null;
  /**
   * Get the identity source portion of the preferred_username from the token.
   *
   * @memberof IKeycloakWrapper
   */
  getIdentitySource: () => string | null;
  /**
   * Get the user guid
   *
   * @memberof IKeycloakWrapper
   */
  getUserGuid: () => string | null;
  /**
   * The user's auth username.F
   *
   * @type {(string | undefined)}
   * @memberof IKeycloakWrapper
   */
  username: string | undefined;
  /**
   * The user's display name.
   *
   * @type {(string | undefined)}
   * @memberof IKeycloakWrapper
   */
  displayName: string | undefined;
  /**
   * The user's email.
   *
   * @type {(string | undefined)}
   * @memberof IKeycloakWrapper
   */
  email: string | undefined;
  /**
   * The user's system user id.
   *
   * @type {(number | undefined)}
   * @memberof IKeycloakWrapper
   */
  systemUserId: number | undefined;
  /**
   * Force this keycloak wrapper to refresh its data.
   *
   * @memberof IKeycloakWrapper
   */
  refresh: () => void;
  /**
   * Generates the URL to sign in using Keycloak.
   *
   * @param {string} [redirectUri] Optionally URL to redirect the user to upon logging in
   * @memberof IKeycloakWrapper
   */
  getLoginUrl: (redirectUri?: string) => string;
  /**
   * The logged in user's data.
   *
   * @type {(ISystemUser | undefined)}
   * @memberof IKeycloakWrapper
   */
  user: ISystemUser | undefined;
  /**
   * The critterbase Uuid.
   *
   * @memberof IKeycloakWrapper
   */
  critterbaseUuid: () => string | undefined;
}

/**
 * Wraps the raw keycloak object, returning an object that contains the original raw keycloak object plus useful helper
 * functions.
 *
 * @return {*}  {IKeycloakWrapper}
 */
function useKeycloakWrapper(): IKeycloakWrapper {
  const { keycloak } = useKeycloak();

  const biohubApi = useBiohubApi();
  const cbApi = useCritterbaseApi();

  const keycloakUserDataLoader = useDataLoader(async () => {
    return (
      (keycloak.token &&
        (keycloak.loadUserInfo() as unknown as IIDIRUserInfo | IBCEIDBasicUserInfo | IBCEIDBusinessUserInfo)) ||
      undefined
    );
  });

  const userDataLoader = useDataLoader(() => biohubApi.user.getUser());

  const critterbaseSignupLoader = useDataLoader(async () => {
    if (userDataLoader?.data?.system_user_id != null) {
      return cbApi.authentication.signUp();
    }
  });

  const administrativeActivityStandingDataLoader = useDataLoader(biohubApi.admin.getAdministrativeActivityStanding);

  if (keycloak) {
    // keycloak is ready, load keycloak user info
    keycloakUserDataLoader.load();
  }

  if (keycloak.authenticated) {
    // keycloak user is authenticated, load system user info
    userDataLoader.load();

    if (userDataLoader.isReady && (!userDataLoader.data?.role_names.length || userDataLoader.data?.record_end_date)) {
      // Authenticated user either has has no roles or has been deactivated
      // Check if the user has a pending access request
      administrativeActivityStandingDataLoader.load();
    }

    if (userDataLoader.isReady && !critterbaseSignupLoader.data) {
      critterbaseSignupLoader.load();
    }
  }

  /**
   * Coerces a string into a user identity source, e.g. BCEID, IDIR, etc.
   *
   * @example _inferIdentitySource('idir'); // => SYSTEM_IDENTITY_SOURCE.IDIR
   *
   * @param userIdentitySource The user identity source string
   * @returns {*} {SYSTEM_IDENTITY_SOURCE | null}
   */
  const _inferIdentitySource = (userIdentitySource: string | undefined): SYSTEM_IDENTITY_SOURCE | null => {
    switch (userIdentitySource) {
      case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
        return SYSTEM_IDENTITY_SOURCE.BCEID_BASIC;

      case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
        return SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS;

      case SYSTEM_IDENTITY_SOURCE.IDIR:
        return SYSTEM_IDENTITY_SOURCE.IDIR;

      default:
        return null;
    }
  };

  /**
   * Parses out the username from a keycloak token, from either the `idir_username` or `bceid_username` field.
   *
   * @param {object} keycloakToken
   * @return {*} {(string | null)}
   */
  const getUserIdentifier = useCallback((): string | null => {
    const userIdentifier =
      (keycloakUserDataLoader.data as IIDIRUserInfo)?.idir_username ||
      (keycloakUserDataLoader.data as IBCEIDBasicUserInfo | IBCEIDBusinessUserInfo)?.bceid_username;

    if (!userIdentifier) {
      return null;
    }

    return userIdentifier.toLowerCase();
  }, [keycloakUserDataLoader.data]);

  /**
   * Parses out the user global user id portion of the preferred_username from the token.
   *
   * @return {*} {(string | null)}
   */ const getUserGuid = useCallback((): string | null => {
    return keycloakUserDataLoader.data?.['preferred_username']?.split('@')?.[0].toLowerCase() || null;
  }, [keycloakUserDataLoader.data]);

  /**
   * Parses out the identity source portion of the preferred_username from the token.
   *
   * @param {object} keycloakToken
   * @return {*} {(string | null)}
   */
  const getIdentitySource = useCallback((): SYSTEM_IDENTITY_SOURCE | null => {
    const userIdentitySource =
      userDataLoader.data?.['identity_source'] ??
      keycloakUserDataLoader.data?.['preferred_username']?.split('@')?.[1].toUpperCase();

    if (!userIdentitySource) {
      return null;
    }

    return _inferIdentitySource(userIdentitySource);
  }, [keycloakUserDataLoader.data, userDataLoader.data]);

  const isSystemUser = (): boolean => {
    return Boolean(userDataLoader.data?.system_user_id);
  };

  const getSystemRoles = (): string[] => {
    return userDataLoader.data?.role_names ?? [];
  };

  const hasSystemRole = (validSystemRoles?: string[]) => {
    if (!validSystemRoles?.length) {
      return true;
    }

    const userSystemRoles = getSystemRoles();

    if (userSystemRoles.some((item) => validSystemRoles.includes(item))) {
      return true;
    }

    return false;
  };

  const username = (): string | undefined => {
    return (
      (keycloakUserDataLoader.data as IIDIRUserInfo)?.idir_username ||
      (keycloakUserDataLoader.data as IBCEIDBasicUserInfo)?.bceid_username
    );
  };

  const displayName = (): string | undefined => {
    return keycloakUserDataLoader.data?.display_name;
  };

  const email = (): string | undefined => {
    return keycloakUserDataLoader.data?.email;
  };

  const refresh = () => {
    userDataLoader.refresh();
    administrativeActivityStandingDataLoader.refresh();
  };

  const systemUserId = (): number | undefined => {
    return userDataLoader.data?.system_user_id;
  };

  const getLoginUrl = (redirectUri = '/admin/projects'): string => {
    return keycloak?.createLoginUrl({ redirectUri: buildUrl(window.location.origin, redirectUri) }) || '/login';
  };

  const user = (): ISystemUser | undefined => {
    return userDataLoader.data;
  };

  const critterbaseUuid = useCallback(() => {
    return critterbaseSignupLoader.data?.user_id;
  }, [critterbaseSignupLoader.data?.user_id]);

  return {
    keycloak,
    hasLoadedAllUserInfo: userDataLoader.isReady || !!administrativeActivityStandingDataLoader.data,
    systemRoles: getSystemRoles(),
    hasSystemRole,
    isSystemUser,
    hasAccessRequest: !!administrativeActivityStandingDataLoader.data?.has_pending_access_request,
    hasOneOrMoreProjectRoles: !!administrativeActivityStandingDataLoader.data?.has_one_or_more_project_roles,
    getUserIdentifier,
    getUserGuid,
    getIdentitySource,
    username: username(),
    email: email(),
    systemUserId: systemUserId(),
    user: user(),
    displayName: displayName(),
    refresh,
    getLoginUrl,
    critterbaseUuid
  };
}

export default useKeycloakWrapper;
