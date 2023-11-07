import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
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

  const isLoading = !simsUserDataLoader.isReady || !administrativeActivityStandingDataLoader.isReady;

  const systemUserId = simsUserDataLoader.data?.system_user_id;

  const userGuid =
    simsUserDataLoader.data?.user_guid ||
    (auth.user?.profile?.idir_user_guid as string) ||
    (auth.user?.profile?.bceid_user_guid as string);

  const userIdentifier =
    simsUserDataLoader.data?.user_identifier ||
    (auth.user?.profile?.idir_username as string) ||
    (auth.user?.profile?.bceid_username as string);

  const displayName = simsUserDataLoader.data?.display_name || (auth.user?.profile?.display_name as string);

  const email = simsUserDataLoader.data?.email || (auth.user?.profile?.email as string);

  const agency = simsUserDataLoader.data?.agency;

  const roleNames = simsUserDataLoader.data?.role_names;

  const identitySource = coerceIdentitySource(
    simsUserDataLoader.data?.identity_source || (auth.user?.profile?.identity_provider as string)?.toUpperCase()
  );

  const hasAccessRequest = !!administrativeActivityStandingDataLoader.data?.has_pending_access_request;

  const hasOneOrMoreProjectRoles = !!administrativeActivityStandingDataLoader.data?.has_one_or_more_project_roles;

  const refresh = () => {
    simsUserDataLoader.refresh();
    administrativeActivityStandingDataLoader.refresh();
  };

  return {
    isLoading,
    systemUserId,
    userGuid,
    userIdentifier,
    displayName,
    email,
    agency,
    roleNames,
    identitySource,
    hasAccessRequest,
    hasOneOrMoreProjectRoles,
    refresh
  };
}

export default useSimsUserWrapper;
