import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  layout: React.ComponentType<any>;
  componentProps?: any;
}

/**
 * A PrivateRoute only allows a user who is authenticated and has the appropriate role(s) or claim(s).
 * @param props - Properties to pass { component, role, claim }
 */
const PrivateRoute: React.FC<IPrivateRouteProps> = (props) => {
  const keycloakWrapper = useKeycloakWrapper();

  let { component: Component, layout: Layout, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!!keycloakWrapper.keycloak?.authenticated) {
          return (
            <Layout>
              <Component {...props} {...rest.componentProps} />
            </Layout>
          );
        }
      }}
    />
  );
};

export default PrivateRoute;
