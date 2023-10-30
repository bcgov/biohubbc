import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useCallback, useMemo } from 'react';
import { useAuth } from 'react-oidc-context';
import { coerceIdentitySource } from 'utils/authUtils';

export interface ISimsUserWrapper {
  /**
   * Set to `true` if the user's information is still loading, false otherwise.
   */
  isLoading: boolean;
  /**
   * The user's system user id.
   */
  systemUserId: number | undefined;
  /**
   * The user's keycloak guid.
   */
  userGuid: string | null | undefined;
  /**
   * The user's identifier (username).
   */
  userIdentifier: string | undefined;
  /**
   * The user's display name.
   */
  displayName: string | undefined;
  /**
   * The user's email address.
   */
  email: string | undefined;
  /**
   * The user's agency.
   */
  agency: string | null | undefined;
  /**
   * The user's system roles (by name).
   */
  roleNames: string[] | undefined;
  /**
   * The logged in user's identity source (IDIR, BCEID BASIC, BCEID BUSINESS, etc).
   */
  identitySource: SYSTEM_IDENTITY_SOURCE | null;
  /**
   * Set to `true` if the user has at least 1 pending access request, `false` otherwise.
   */
  hasAccessRequest: boolean;
  /**
   * Set to `true` if the user has at least 1 project participant roles, `false` otherwise.
   */
  hasOneOrMoreProjectRoles: boolean;
  /**
   * Returns `true` if the logged in user has at least one of the provided `validSystemRoles`, `false` otherwise.
   *
   * Note: If no `validSystemRoles` provided, returns `true`.
   */
  hasSystemRole: (validSystemRoles?: string[]) => boolean;
  /**
   * Force this sims user wrapper to refresh its data.
   */
  refresh: () => void;
}

function useSimsUserWrapper(): ISimsUserWrapper {
  const auth = useAuth();

  const biohubApi = useBiohubApi();

  const simsUserDataLoader = useDataLoader(() => biohubApi.user.getUser());

  const administrativeActivityStandingDataLoader = useDataLoader(() =>
    biohubApi.admin.getAdministrativeActivityStanding()
  );

  if (auth.isAuthenticated) {
    simsUserDataLoader.load();
    administrativeActivityStandingDataLoader.load();
  }

  const identitySource = useMemo(() => {
    const userIdentitySource = simsUserDataLoader.data?.identity_source;

    if (!userIdentitySource) {
      return null;
    }

    return coerceIdentitySource(userIdentitySource);
  }, [simsUserDataLoader.data?.identity_source]);

  const hasSystemRole = useCallback(
    (validSystemRoles?: string[]) => {
      if (!validSystemRoles?.length) {
        return true;
      }

      const userSystemRoles = simsUserDataLoader.data?.role_names;

      if (userSystemRoles?.some((item) => validSystemRoles.includes(item))) {
        return true;
      }

      return false;
    },
    [simsUserDataLoader.data?.role_names]
  );

  const hasAccessRequest = !!administrativeActivityStandingDataLoader.data?.has_pending_access_request;

  const hasOneOrMoreProjectRoles = !!administrativeActivityStandingDataLoader.data?.has_one_or_more_project_roles;

  const refresh = () => {
    simsUserDataLoader.refresh();
    administrativeActivityStandingDataLoader.refresh();
  };

  return {
    isLoading: !simsUserDataLoader.isReady || !administrativeActivityStandingDataLoader.isReady,
    systemUserId: simsUserDataLoader.data?.system_user_id,
    userGuid: simsUserDataLoader.data?.user_guid,
    userIdentifier: simsUserDataLoader.data?.user_identifier,
    displayName: simsUserDataLoader.data?.display_name,
    email: simsUserDataLoader.data?.email,
    agency: simsUserDataLoader.data?.agency,
    roleNames: simsUserDataLoader.data?.role_names,
    identitySource: identitySource,
    hasAccessRequest,
    hasOneOrMoreProjectRoles,
    hasSystemRole,
    refresh
  };
}

export default useSimsUserWrapper;
