import { useKeycloak } from '@react-keycloak/web';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import { useEffect, useState } from 'react';
import { useBiohubApi } from './useBioHubApi';

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
  hasUserLoaded: boolean;
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
  hasSystemRole: (validSystemRoles: string[]) => boolean;
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

  useEffect(() => {
    const getUser = async () => {
      const userDetails = await biohubApi.user.getUser();

      setHasUserLoaded(true);

      setUser(userDetails);
    };

    if (hasUserLoaded || isUserLoading) {
      return;
    }

    setIsUserLoading(true);

    getUser();
  }, [keycloak, user, hasUserLoaded, isUserLoading, biohubApi.user]);

  const getSystemRoles = (): string[] => {
    return user?.role_names || [];
  };

  const hasSystemRole = (validSystemRoles: string[]) => {
    const userSystemRoles = getSystemRoles();

    for (const validRole of validSystemRoles) {
      if (userSystemRoles.includes(validRole)) {
        return true;
      }
    }

    return false;
  };

  return {
    keycloak: keycloak,
    hasUserLoaded,
    systemRoles: getSystemRoles(),
    hasSystemRole
  };
}

export default useKeycloakWrapper;
