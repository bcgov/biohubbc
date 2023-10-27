import CircularProgress from '@mui/material/CircularProgress';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { useAuthStateContext } from 'contexts/useAuthStateContext';
import { useRedirectUri } from 'hooks/useRedirect';
import { useContext, useEffect } from 'react';
import { hasAuthParams } from 'react-oidc-context';
import { Redirect, Route, RouteProps, useLocation } from 'react-router';
import { buildUrl } from 'utils/Utils';

export interface ISystemRoleRouteGuardProps extends RouteProps {
  /**
   * Indicates the sufficient roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {string[]}
   */
  validRoles?: string[];
}

export interface IProjectRoleRouteGuardProps extends RouteProps {
  /**
   * Indicates the sufficient project roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {string[]}
   */
  validProjectRoles?: string[];

  /**
   * Indicates the sufficient project permissions needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {string[]}
   */
  validProjectPermissions?: string[];

  /**
   * Indicates the sufficient system roles that will grant access to this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {string[]}
   */
  validSystemRoles?: string[];
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

  if (!authStateContext.simsUserWrapper.isReady) {
    // User data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" />;
  }

  if (!authStateContext.simsUserWrapper.hasSystemRole(props.validRoles)) {
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

  if (!authStateContext.simsUserWrapper.isReady || !projectAuthStateContext.hasLoadedParticipantInfo) {
    // Participant data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" />;
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
 * Route guard that requires the user to be authenticated.
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
      authStateContext.isReady &&
      !hasAuthParams() &&
      !authStateContext.auth.isAuthenticated &&
      !authStateContext.auth.activeNavigator
    ) {
      // User is not authenticated and has no active authentication navigator
      authStateContext.auth.signinRedirect({ redirect_uri: buildUrl(window.location.origin, location.pathname) });
    }
  }, [authStateContext.auth, authStateContext.isReady, location.pathname]);

  if (
    !authStateContext.isReady ||
    !authStateContext.simsUserWrapper.isReady ||
    !authStateContext.auth.isAuthenticated
  ) {
    return <CircularProgress className="pageProgress" />;
  }

  if (!authStateContext.auth.isAuthenticated) {
    // Redirect to forbidden page
    return <Redirect to="/forbidden" />;
  }

  if (!authStateContext.simsUserWrapper.systemUserId) {
    // User is not a registered system user
    if (authStateContext.simsUserWrapper.hasAccessRequest) {
      // The user has a pending access request, restrict them to the request-submitted or logout pages
      if (location.pathname !== '/request-submitted') {
        return <Redirect to="/request-submitted" />;
      }
    } else {
      // The user does not have a pending access request, restrict them to the access-request or request-submitted pages
      if (!['/access-request', '/request-submitted'].includes(location.pathname)) {
        /**
         * User attempted to go to restricted page. If the request to fetch user data fails, the user
         * can never navigate away from the forbidden page unless they refetch the user data by refreshing
         * the browser. We can preemptively re-attempt to load the user data again each time they attempt to navigate
         * away from the forbidden page.
         */
        authStateContext.simsUserWrapper.refresh();
        // Redirect to forbidden page
        return <Redirect to="/forbidden" />;
      }
    }
  }

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

  console.log('redirectUri', redirectUri);

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
