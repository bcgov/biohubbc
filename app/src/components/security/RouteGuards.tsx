import CircularProgress from '@mui/material/CircularProgress';
import { AuthStateContext } from 'contexts/authStateContext';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
// import useRedirect from 'hooks/useRedirect';
import React, { PropsWithChildren, useContext } from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router';

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
 * @param {*} { children, validRoles, ...rest }
 * @return {*}
 */
export const SystemRoleRouteGuard = (props: ISystemRoleRouteGuardProps) => {
  const { validRoles, children, ...rest } = props;

  return (
    <WaitForKeycloakToLoadUserInfo>
      <CheckIfUserHasSystemRole validRoles={validRoles}>
        <Route {...rest}>{children}</Route>
      </CheckIfUserHasSystemRole>
    </WaitForKeycloakToLoadUserInfo>
  );
};

/**
 * Route guard that requires the user to have at least 1 of the specified project roles.
 *
 * Note: Does not check if they are already authenticated.
 *
 * @param {*} { children, validRoles, ...rest }
 * @return {*}
 */
export const ProjectRoleRouteGuard = (props: IProjectRoleRouteGuardProps) => {
  const { validSystemRoles, validProjectRoles, validProjectPermissions, children, ...rest } = props;

  return (
    <WaitForProjectParticipantInfo>
      <CheckIfUserHasProjectRole {...{ validSystemRoles, validProjectRoles, validProjectPermissions }}>
        <Route {...rest}>{children}</Route>
      </CheckIfUserHasProjectRole>
    </WaitForProjectParticipantInfo>
  );
};

/**
 * Route guard that requires the user to be authenticated.
 *
 * @param {*} { children, ...rest }
 * @return {*}
 */
export const AuthenticatedRouteGuard = (props: RouteProps) => {
  const { children, ...rest } = props;

  return (
    <CheckForKeycloakAuthenticated>
      <WaitForKeycloakToLoadUserInfo>
        <CheckIfAuthenticatedUser>
          <Route {...rest}>{children}</Route>
        </CheckIfAuthenticatedUser>
      </WaitForKeycloakToLoadUserInfo>
    </CheckForKeycloakAuthenticated>
  );
};

/**
 * Route guard that requires the user to not be authenticated.
 *
 * @param {*} { children, ...rest }
 * @return {*}
 */
export const UnAuthenticatedRouteGuard = (props: RouteProps) => {
  const { children, ...rest } = props;

  return (
    <CheckIfNotAuthenticatedUser>
      <Route {...rest}>{children}</Route>
    </CheckIfNotAuthenticatedUser>
  );
};

/**
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const CheckForKeycloakAuthenticated = (props: PropsWithChildren<Record<never, unknown>>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const location = useLocation();

  if (!keycloakWrapper?.keycloak.isAuthenticated) {
    console.log('CheckForKeycloakAuthenticated', location.pathname);
    // Trigger login, then redirect to the desired route
    return <Redirect to={`/login?redirect=${encodeURIComponent(location.pathname)}`} />;
  }

  return <>{props.children}</>;
};

/**
 * Waits for the keycloakWrapper to finish loading user info.
 *
 * Renders a spinner or the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const WaitForKeycloakToLoadUserInfo: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!keycloakWrapper?.hasLoadedAllUserInfo) {
    // User data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" />;
  }

  return <>{children}</>;
};

/**
 * Waits for the projectAuthStateContext to finish loading project participant info.
 *
 * Renders a spinner or the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const WaitForProjectParticipantInfo = (props: PropsWithChildren<Record<never, unknown>>) => {
  const projectAuthStateContext = useContext(ProjectAuthStateContext);

  if (!projectAuthStateContext.hasLoadedParticipantInfo) {
    // Participant data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" />;
  }

  return <>{props.children}</>;
};

/**
 * Checks if the user is a registered user or has a pending access request.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const CheckIfAuthenticatedUser = (props: PropsWithChildren<Record<never, unknown>>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const location = useLocation();

  if (!keycloakWrapper?.isSystemUser()) {
    // User is not a registered system user
    if (keycloakWrapper?.hasAccessRequest) {
      // The user has a pending access request, restrict them to the request-submitted or logout pages
      if (location.pathname !== '/request-submitted' && location.pathname !== '/logout') {
        return <Redirect to="/request-submitted" />;
      }
    } else {
      // The user does not have a pending access request, restrict them to the access-request, request-submitted or logout pages
      if (!['/access-request', '/request-submitted', '/logout'].includes(location.pathname)) {
        /**
         * User attempted to go to restricted page. If the request to fetch user data fails, the user
         * can never navigate away from the forbidden page unless they refetch the user data by refreshing
         * the browser. We can preemptively re-attempt to load the user data again each time they attempt to navigate
         * away from the forbidden page.
         */
        keycloakWrapper?.refresh();

        // Redirect to forbidden page
        return <Redirect to="/forbidden" />;
      }
    }
  }

  return <>{props.children}</>;
};

/**
 * Checks if the user is not a registered user.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const CheckIfNotAuthenticatedUser = (props: PropsWithChildren<Record<never, unknown>>) => {
  const { keycloakWrapper } = useContext(AuthStateContext);
//   const { redirect } = useRedirect('/');

  if (keycloakWrapper?.keycloak.isAuthenticated) {
    console.log('CheckIfNotAuthenticatedUser');
    /**
     * If the user happens to be authenticated, rather than just redirecting them to `/`, we can
     * check if the URL contains a redirect query param, and send them there instead (for
     * example, links to `/login` generated by SIMS will typically include a redirect query param).
     * If there is no redirect query param, they will be sent to `/` as a fallback.
     */
    // redirect();

    return <></>;
  }

  return <>{props.children}</>;
};

/**
 * Checks if a user has at least 1 of the specified `validRoles`.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children, validRoles }
 * @return {*}
 */
const CheckIfUserHasSystemRole = (props: ISystemRoleRouteGuardProps) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!keycloakWrapper?.hasSystemRole(props.validRoles)) {
    return <Redirect to="/forbidden" />;
  }

  return <>{props.children}</>;
};

/**
 * Checks if a user has at least 1 of the specified `validRoles`.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children, validRoles }
 * @return {*}
 */
const CheckIfUserHasProjectRole = (props: IProjectRoleRouteGuardProps) => {
  const { validProjectRoles, validSystemRoles, validProjectPermissions, children } = props;
  const { hasProjectRole, hasSystemRole, hasProjectPermission } = useContext(ProjectAuthStateContext);

  if (
    hasProjectRole(validProjectRoles) ||
    hasSystemRole(validSystemRoles) ||
    hasProjectPermission(validProjectPermissions)
  ) {
    return <>{children}</>;
  }

  return <Redirect to="/forbidden" />;
};
