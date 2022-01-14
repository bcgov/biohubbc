import { CircularProgress } from '@material-ui/core';
import { AuthStateContext } from 'contexts/authStateContext';
import qs from 'qs';
import React, { useContext } from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router';

export type ISystemRoleRouteGuardProps = RouteProps & {
  /**
   * Indicates the sufficient roles needed to access this route, if any.
   *
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {string[]}
   */
  validRoles?: string[];
};

/**
 * Route guard that requires the user to have at least 1 of the specified system roles.
 *
 * Note: Does not check if they are already authenticated.
 *
 * @param {*} { children, validRoles, ...rest }
 * @return {*}
 */
export const SystemRoleRouteGuard: React.FC<ISystemRoleRouteGuardProps> = ({ children, validRoles, ...rest }) => {
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
 * Route guard that requires the user to be authenticated.
 *
 * @param {*} { children, ...rest }
 * @return {*}
 */
export const AuthenticatedRouteGuard: React.FC<RouteProps> = ({ children, ...rest }) => {
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
      if (
        location.pathname !== '/access-request' &&
        location.pathname !== '/request-submitted' &&
        location.pathname !== '/logout'
      ) {
        // User attempted to go to restricted page
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
