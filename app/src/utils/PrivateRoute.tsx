import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';

interface IPrivateRouteProps extends RouteProps {
  validRoles?: string[];
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

  let { validRoles, component: Component, layout: Layout, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(props) => {
          if (!!keycloakWrapper.keycloak?.authenticated) {
              console.log('keycloakWrapper.keycloak?.authenticated', keycloakWrapper.keycloak?.authenticated);
              console.log('keycloakWrapper.hasSystemRole', keycloakWrapper.hasSystemRole(validRoles));
              console.log('keycloakWrapper.hasAccessRequest', keycloakWrapper.hasAccessRequest);

            if (!keycloakWrapper.hasSystemRole(validRoles)) {

              if (keycloakWrapper.hasAccessRequest) {


                return <Redirect to="/request-submitted" />;
              } else {
                return <Redirect to="/forbidden" />;
              }
            }

            return (
              <Layout>
                <Component {...props} {...rest.componentProps} />
              </Layout>
            );
          } else {
            return <Redirect to="/forbidden" />;
          }
      }}
    />
  );
};

export default PrivateRoute;
