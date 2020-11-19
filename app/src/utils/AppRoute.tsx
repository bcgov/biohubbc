import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import PrivateRoute from 'utils/PrivateRoute';

export type IAppRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  protected?: boolean;
  title: string;
};

const AppRoute: React.FC<IAppRouteProps> = ({
  component: Component,
  layout,
  protected: usePrivateRoute,
  title,
  ...rest
}) => {
  const Layout = layout === undefined ? (props: any) => <>{props.children}</> : layout;

  document.title = title;

  if (!!usePrivateRoute) {
    return <PrivateRoute {...rest} component={Component} layout={Layout} />;
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
