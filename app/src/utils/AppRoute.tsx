import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import PrivateRoute from 'utils/PrivateRoute';

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
  title,
  validRoles,
  ...rest
}) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;

  document.title = title;

  if (!!usePrivateRoute) {
    return <PrivateRoute {...rest} validRoles={validRoles} component={Component} layout={Layout} />;
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
