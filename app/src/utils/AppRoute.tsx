import React, { useContext } from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';
import PrivateRoute from 'utils/PrivateRoute';
import { AuthStateContext } from 'contexts/authStateContext';

export type IAppRouteProps = RouteProps & {
  /**
   * The title for the browser window/tab.
   *
   * @type {string}
   */
  title: string;
  /**
   * The component to render.
   *
   * @type {React.ComponentType<any>}
   */
  component: React.ComponentType<any>;
  /**
   * If specified, the `component` will be rendered as a child of the `layout`.
   *
   * @type {React.ComponentType<any>}
   */
  layout?: React.ComponentType<any>;
  /**
   * Indicates that the user must be authenticated to access this route.
   *
   * @type {boolean}
   */
  protected?: boolean;
  /**
   * Indicates that both authenticated and un-authenticated users can access this route.
   *
   * Typically, logged in users should be re-directed to the authenticated side of the site, away from the public side.
   * However, some pages have no opinion on the authenticated state of the user.
   *
   * @type {boolean}
   */
  anyAuth?: boolean;
  /**
   * Indicates the sufficient roles needed to access this route, if any.
   *
   * Note: Will do nothing if `protected` is false.
   * Note: The user only needs 1 of the valid roles, when multiple are specified.
   *
   * @type {string[]}
   */
  validRoles?: string[];
};

const AppRoute: React.FC<IAppRouteProps> = ({
  component: Component,
  layout,
  protected: usePrivateRoute,
  anyAuth,
  title,
  validRoles,
  ...rest
}) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;

  document.title = title;

  if (!!usePrivateRoute) {
    return <PrivateRoute {...rest} validRoles={validRoles} component={Component} layout={Layout} />;
  }

  if (!anyAuth) {
    // This route should only be accessed by un-authenticated users
    if (keycloakWrapper?.keycloak?.authenticated) {
      // User is logged in
      return <Redirect to="/admin/projects" />;
    }
  }

  return (
    <Route
      {...rest}
      render={(props) => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

export default AppRoute;
