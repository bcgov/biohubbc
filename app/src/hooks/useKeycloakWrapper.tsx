import { useKeycloak } from '@react-keycloak/web';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import { useCallback, useEffect, useState } from 'react';
import { useBiohubApi } from './useBioHubApi';

/**
 * IUserInfo interface, represents the userinfo provided by keycloak.
 */
export interface IUserInfo {
  name?: string;
  preferred_username?: string;
  given_name?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
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
   * @type {*}
   * @memberof IKeycloakWrapper
   */
  keycloak: any;
  /**
   * Returns `true` if the user's information has been loaded, false otherwise.
   *
   * @type {boolean}
   * @memberof IKeycloakWrapper
   */
  hasLoadedUserRelevantInfo: boolean;
  /**
   * The user's system roles, if any.
   *
   * @type {string[]}
   * @memberof IKeycloakWrapper
   */
  systemRoles: string[];
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
  username: string | undefined;
  displayName: string | undefined;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
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

  const [user, setUser] = useState<IGetUserResponse>();

  const [isUserLoading, setIsUserLoading] = useState<boolean>(false);
  const [hasUserLoaded, setHasUserLoaded] = useState<boolean>(false);
  const [hasLoadedUserRelevantInfo, setHasLoadedUserRelevantInfo] = useState<boolean>(false);
  const [keycloakUserInfo, setKeycloakUserInfo] = useState<IUserInfo | null>(null);
  const [hasAccessRequest, setHasAccessRequest] = useState<boolean>(false);
  const [shouldLoadAccessRequest, setShouldLoadAccessRequest] = useState<boolean>(false);

  /**
   * Parses out the username portion of the preferred_username from the token.
   *
   * @param {object} keycloakToken
   * @return {*} {(string | null)}
   */
  const getUserIdentifier = useCallback((): string | null => {
    const userIdentifier = keycloakUserInfo?.['preferred_username']?.split('@')?.[0];

    if (!userIdentifier) {
      return null;
    }

    return userIdentifier;
  }, [keycloakUserInfo]);

  /**
   * Parses out the identity source portion of the preferred_username from the token.
   *
   * @param {object} keycloakToken
   * @return {*} {(string | null)}
   */
  const getIdentitySource = useCallback((): string | null => {
    const identitySource = keycloakUserInfo?.['preferred_username']?.split('@')?.[1];

    if (!identitySource) {
      return null;
    }

    return identitySource;
  }, [keycloakUserInfo]);

  useEffect(() => {
    const getUser = async () => {
      let userDetails: IGetUserResponse;

      try {
        userDetails = await biohubApi.user.getUser();
      } catch {}

      setUser(() => {
        setHasUserLoaded(true);
        if (userDetails?.role_names?.length) {
          setHasLoadedUserRelevantInfo(true);
        } else {
          setShouldLoadAccessRequest(true);
        }

        return userDetails;
      });
    };

    if (hasUserLoaded || isUserLoading) {
      return;
    }

    setIsUserLoading(true);

    getUser();
  }, [keycloak, user, hasUserLoaded, isUserLoading, biohubApi.user]);

  useEffect(() => {
    const getSystemAccessRequest = async () => {
      const accessRequests = await biohubApi.admin.hasPendingAdministrativeActivities();

      setHasAccessRequest(() => {
        setHasLoadedUserRelevantInfo(true);
        return accessRequests > 0;
      });
    };

    if (!keycloakUserInfo || !shouldLoadAccessRequest) {
      return;
    }

    getSystemAccessRequest();
  }, [biohubApi.admin, getUserIdentifier, hasAccessRequest, keycloakUserInfo, shouldLoadAccessRequest]);

  useEffect(() => {
    const loadUserInfo = async () => {
      const user = (await keycloak?.loadUserInfo()) as IUserInfo;
      setKeycloakUserInfo(user);
    };

    if (keycloakUserInfo || !keycloak?.authenticated) {
      return;
    }

    loadUserInfo();
  }, [keycloakUserInfo, keycloak]);

  const getSystemRoles = (): string[] => {
    return user?.role_names || [];
  };

  const hasSystemRole = (validSystemRoles?: string[]) => {
    if (!validSystemRoles || !validSystemRoles.length) {
      return true;
    }
    const userSystemRoles = getSystemRoles();

    for (const validRole of validSystemRoles) {
      if (userSystemRoles.includes(validRole)) {
        return true;
      }
    }

    return false;
  };

  const username = (): string | undefined => {
    return keycloakUserInfo?.preferred_username;
  };

  const displayName = (): string | undefined => {
    return keycloakUserInfo?.name || keycloakUserInfo?.preferred_username;
  };

  const email = (): string | undefined => {
    return keycloakUserInfo?.email;
  };

  const firstName = (): string | undefined => {
    return keycloakUserInfo?.firstName;
  };

  const lastName = (): string | undefined => {
    return keycloakUserInfo?.lastName;
  };

  return {
    keycloak: keycloak,
    hasLoadedUserRelevantInfo,
    systemRoles: getSystemRoles(),
    hasSystemRole,
    hasAccessRequest,
    getUserIdentifier,
    getIdentitySource,
    username: username(),
    email: email(),
    displayName: displayName(),
    firstName: firstName(),
    lastName: lastName()
  };
}

export default useKeycloakWrapper;
