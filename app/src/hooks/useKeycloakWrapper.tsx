import { useKeycloak } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import { useCallback } from 'react';
import { useBiohubApi } from './useBioHubApi';
import useDataLoader from './useDataLoader';

export enum SYSTEM_IDENTITY_SOURCE {
  BCEID_BUSINESS = 'BCEIDBUSINESS',
  BCEID_BASIC = 'BCEIDBASIC',
  IDIR = 'IDIR'
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
   * @type {(Keycloak | undefined)}
   * @memberof IKeycloakWrapper
   */
  keycloak: Keycloak | undefined;
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
   * @TODO jsdoc
   * @returns
   */
  getUserGuid: () => string | null;
  username: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  /**
   * Force this keycloak wrapper to refresh its data.
   *
   * Note: currently this only refreshes the `hasAccessRequest` property.
   *
   * @memberof IKeycloakWrapper
   */
  refresh: () => void;
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

  const keycloakUserDataLoader = useDataLoader(async () => {
    return (
      (keycloak &&
        ((keycloak.loadUserInfo() as unknown) as IIDIRUserInfo | IBCEIDBasicUserInfo | IBCEIDBusinessUserInfo)) ||
      undefined
    );
  });

  const userDataLoader = useDataLoader(() => biohubApi.user.getUser());

  const hasPendingAdministrativeActivitiesDataLoader = useDataLoader(() =>
    biohubApi.admin.hasPendingAdministrativeActivities()
  );

  if (keycloak) {
    // keycloak is ready, load keycloak user info
    keycloakUserDataLoader.load();
  }

  if (keycloak?.authenticated) {
    // keycloak user is authenticated, load system user info
    userDataLoader.load();

    if (
      userDataLoader.isReady &&
      (!userDataLoader.data?.role_names.length || userDataLoader.data?.user_record_end_date)
    ) {
      // Authenticated user either has has no roles or has been deactivated
      // Check if the user has a pending access request
      hasPendingAdministrativeActivitiesDataLoader.load();
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
   * @TODO jsdoc
   */
  const getUserGuid = useCallback((): string | null => {
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
      userDataLoader.data?.['identity_source'] ||
      keycloakUserDataLoader.data?.['preferred_username']?.split('@')?.[1].toUpperCase();

    if (!userIdentitySource) {
      return null;
    }

    return _inferIdentitySource(userIdentitySource);
  }, [keycloakUserDataLoader.data, userDataLoader.data]);

  const isSystemUser = (): boolean => {
    return Boolean(userDataLoader.data?.id);
  };

  const getSystemRoles = (): string[] => {
    return userDataLoader.data?.role_names || [];
  };

  const hasSystemRole = (validSystemRoles?: string[]) => {
    if (!validSystemRoles || !validSystemRoles.length) {
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
    hasPendingAdministrativeActivitiesDataLoader.refresh();
  };

  return {
    keycloak,
    hasLoadedAllUserInfo: userDataLoader.isReady || !!hasPendingAdministrativeActivitiesDataLoader.data,
    systemRoles: getSystemRoles(),
    hasSystemRole,
    isSystemUser,
    hasAccessRequest: !!hasPendingAdministrativeActivitiesDataLoader.data,
    getUserIdentifier,
    getUserGuid,
    getIdentitySource,
    username: username(),
    email: email(),
    displayName: displayName(),
    refresh
  };
}

export default useKeycloakWrapper;
