import CircularProgress from '@mui/material/CircularProgress';
import { PROJECT_PERMISSION, PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useRedirectUri } from 'hooks/useRedirect';
import { useContext, useEffect } from 'react';
import { hasAuthParams } from 'react-oidc-context';
import { Redirect, Route, RouteProps, useLocation } from 'react-router';
import { hasAtLeastOneValidValue } from 'utils/authUtils';
import { buildUrl } from 'utils/Utils';

export interface ISystemRoleRouteGuardProps extends RouteProps {
  /**
   * Indicates the sufficient roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {SYSTEM_ROLE[]}
   */
  validRoles?: SYSTEM_ROLE[];
}

export interface IProjectRoleRouteGuardProps extends RouteProps {
  /**
   * Indicates the sufficient project roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {PROJECT_ROLE[]}
   */
  validProjectRoles?: PROJECT_ROLE[];

  /**
   * Indicates the sufficient project permissions needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {PROJECT_PERMISSION[]}
   */
  validProjectPermissions?: PROJECT_PERMISSION[];

  /**
   * Indicates the sufficient system roles that will grant access to this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {SYSTEM_ROLE[]}
   */
  validSystemRoles?: SYSTEM_ROLE[];
}

/**
 * Route guard that requires the user to have at least 1 of the specified system roles.
 *
 * Note: Does not check if they are already authenticated.
 *
 * @param {ISystemRoleRouteGuardProps} props
 * @return {*}
 */
export const SystemRoleRouteGuard = (props: ISystemRoleRouteGuardProps) => {
  const { validRoles, children, ...rest } = props;

  const authStateContext = useAuthStateContext();

  if (authStateContext.auth.isLoading || authStateContext.simsUserWrapper.isLoading) {
    // User data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" data-testid="system-role-guard-spinner" />;
  }

  if (!hasAtLeastOneValidValue(props.validRoles, authStateContext.simsUserWrapper.roleNames)) {
    return <Redirect to="/forbidden" />;
  }

  return <Route {...rest}>{children}</Route>;
};

/**
 * Route guard that requires the user to have at least 1 of the specified project roles.
 *
 * Note: Does not check if they are already authenticated.
 *
 * @param {IProjectRoleRouteGuardProps} props
 * @return {*}
 */
export const ProjectRoleRouteGuard = (props: IProjectRoleRouteGuardProps) => {
  const { validSystemRoles, validProjectRoles, validProjectPermissions, children, ...rest } = props;

  const authStateContext = useAuthStateContext();

  const projectAuthStateContext = useContext(ProjectAuthStateContext);

  if (
    authStateContext.auth.isLoading ||
    authStateContext.simsUserWrapper.isLoading ||
    !projectAuthStateContext.hasLoadedParticipantInfo
  ) {
    // Participant data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" data-testid="project-role-guard-spinner" />;
  }

  if (
    !projectAuthStateContext.hasProjectRole(validProjectRoles) &&
    !projectAuthStateContext.hasSystemRole(validSystemRoles) &&
    !projectAuthStateContext.hasProjectPermission(validProjectPermissions)
  ) {
    return <Redirect to="/forbidden" />;
  }

  return <Route {...rest}>{children}</Route>;
};

/**
 * Route guard that requires the user to be authenticated and registered with Sims.
 *
 * @param {RouteProps} props
 * @return {*}
 */
export const AuthenticatedRouteGuard = (props: RouteProps) => {
  const { children, ...rest } = props;

  const authStateContext = useAuthStateContext();

  const location = useLocation();

  useEffect(() => {
    if (
      !authStateContext.auth.isLoading &&
      !hasAuthParams() &&
      !authStateContext.auth.isAuthenticated &&
      !authStateContext.auth.activeNavigator
    ) {
      // User is not authenticated and has no active authentication navigator, redirect to the keycloak login page
      authStateContext.auth.signinRedirect({ redirect_uri: buildUrl(window.location.origin, location.pathname) });
    }
  }, [authStateContext.auth, location.pathname]);

  if (
    authStateContext.auth.isLoading ||
    authStateContext.simsUserWrapper.isLoading ||
    !authStateContext.auth.isAuthenticated
  ) {
    return <CircularProgress className="pageProgress" data-testid={'authenticated-route-guard-spinner'} />;
  }

  if (!authStateContext.simsUserWrapper.systemUserId) {
    // User is not a registered system user

    if (authStateContext.simsUserWrapper.hasAccessRequest && !['/request-submitted'].includes(location.pathname)) {
      // The user has a pending access request and isn't already navigating to the request submitted page
      return <Redirect to="/request-submitted" />;
    }

    // The user does not have a pending access request, restrict them to public pages
    if (!['/', '/access-request', '/request-submitted'].includes(location.pathname)) {
      /**
       * User attempted to go to a non-public page. If the request to fetch user data fails, the user
       * can never navigate away from the forbidden page unless they refetch the user data by refreshing
       * the browser. We can preemptively re-attempt to load the user data again each time they attempt to navigate
       * away from the forbidden page.
       */
      authStateContext.simsUserWrapper.refresh();
      // Redirect to forbidden page
      return <Redirect to="/forbidden" />;
    }
  }

  // The user is a registered system user
  return <Route {...rest}>{children}</Route>;
};

/**
 * Route guard that requires the user to not be authenticated.
 *
 * @param {RouteProps} props
 * @return {*}
 */
export const UnAuthenticatedRouteGuard = (props: RouteProps) => {
  const { children, ...rest } = props;

  const authStateContext = useAuthStateContext();

  const redirectUri = useRedirectUri('/');

  if (authStateContext.auth.isAuthenticated) {
    /**
     * If the user happens to be authenticated, rather than just redirecting them to `/`, we can
     * check if the URL contains a redirect query param, and send them there instead (for
     * example, links to `/login` generated by SIMS will typically include a redirect query param).
     * If there is no redirect query param, they will be sent to `/` as a fallback.
     */
    return <Redirect to={redirectUri} />;
  }

  return <Route {...rest}>{children}</Route>;
};
