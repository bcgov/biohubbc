import CircularProgress from '@material-ui/core/CircularProgress';
import { AuthStateContext } from 'contexts/authStateContext';
import { ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import qs from 'qs';
import React, { useContext } from 'react';
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
};

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
   * Indicates the sufficient system roles that will grant access to this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {string[]}
   */
    validSystemRoles?: string[];
};

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
        <Route
          {...rest}
          render={(props) => {
            return (
              <>
                {React.Children.map(children, (child: any) => {
                  return React.cloneElement(child, props);
                })}
              </>
            );
          }}
        />
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
  const { validSystemRoles, validProjectRoles, children, ...rest } = props;

  return (
    <WaitForProjectParticipantInfo>
      <CheckIfUserHasProjectRole {...{ validSystemRoles, validProjectRoles}}>
        <Route
          {...rest}
          render={(props) => {
            return (
              <>
                {React.Children.map(children, (child: any) => {
                  return React.cloneElement(child, props);
                })}
              </>
            );
          }}
        />
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
    <CheckForAuthLoginParam>
      <WaitForKeycloakToLoadUserInfo>
        <CheckIfAuthenticatedUser>
          <Route
            {...rest}
            render={(props) => {
              return (
                <>
                  {React.Children.map(children, (child: any) => {
                    return React.cloneElement(child, props);
                  })}
                </>
              );
            }}
          />
        </CheckIfAuthenticatedUser>
      </WaitForKeycloakToLoadUserInfo>
    </CheckForAuthLoginParam>
  );
};

/**
 * Route guard that requires the user to not be authenticated.
 *
 * @param {*} { children, ...rest }
 * @return {*}
 */
export const UnAuthenticatedRouteGuard: React.FC<RouteProps> = ({ children, ...rest }) => {
  return (
    <CheckIfNotAuthenticatedUser>
      <Route
        {...rest}
        render={(props) => {
          return (
            <>
              {React.Children.map(children, (child: any) => {
                return React.cloneElement(child, props);
              })}
            </>
          );
        }}
      />
    </CheckIfNotAuthenticatedUser>
  );
};

/**
 * Checks for query param `authLogin=true`. If set, force redirect the user to the keycloak login page.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const CheckForAuthLoginParam: React.FC = ({ children }) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const location = useLocation();

  if (!keycloakWrapper?.keycloak?.authenticated) {
    const urlParams = qs.parse(location.search.replace('?', ''));
    const authLoginUrlParam = urlParams.authLogin;
    // check for urlParam to force login
    if (authLoginUrlParam) {
      // remove authLogin url param from url to stop possible loop redirect
      const redirectUrlParams = qs.stringify(urlParams, { filter: (prefix) => prefix !== 'authLogin' });
      const redirectUri = `${window.location.origin}${location.pathname}?${redirectUrlParams}`;

      // trigger login
      keycloakWrapper?.keycloak?.login({ redirectUri: redirectUri });
    }

    return <Redirect to="/" />;
  }

  return <>{children}</>;
};

/**
 * Waits for the keycloakWrapper to finish loading user info.
 *
 * Renders a spinner or the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const WaitForKeycloakToLoadUserInfo: React.FC = ({ children }) => {
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
const WaitForProjectParticipantInfo: React.FC = ({ children }) => {
  const projectAuthStateContext = useContext(ProjectAuthStateContext);

  if (!projectAuthStateContext.hasLoadedParticipantInfo) {
    // Participant data has not been loaded, can not yet determine if user has sufficient roles
    return <CircularProgress className="pageProgress" />;
  }

  return <>{children}</>;
};

/**
 * Checks if the user is a registered user or has a pending access request.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const CheckIfAuthenticatedUser: React.FC = ({ children }) => {
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

  return <>{children}</>;
};

/**
 * Checks if the user is not a registered user.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children }
 * @return {*}
 */
const CheckIfNotAuthenticatedUser: React.FC = ({ children }) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (keycloakWrapper?.keycloak?.authenticated) {
    return <Redirect to="/admin/" />;
  }

  return <>{children}</>;
};

/**
 * Checks if a user has at least 1 of the specified `validRoles`.
 *
 * Redirects the user as appropriate, or renders the `children`.
 *
 * @param {*} { children, validRoles }
 * @return {*}
 */
const CheckIfUserHasSystemRole: React.FC<{ validRoles?: string[] }> = ({ children, validRoles }) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!keycloakWrapper?.hasSystemRole(validRoles)) {
    return <Redirect to="/forbidden" />;
  }

  return <>{children}</>;
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
  const { validProjectRoles, validSystemRoles, children } = props;
  const { hasProjectRole, hasSystemRole } = useContext(ProjectAuthStateContext);

  if (hasProjectRole(validProjectRoles) || hasSystemRole(validSystemRoles)) {
    return <>{children}</>;
  }

  return <Redirect to="/forbidden" />;
};
