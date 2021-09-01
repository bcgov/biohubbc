import CircularProgress from '@material-ui/core/CircularProgress';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

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
  const { keycloakWrapper } = useContext(AuthStateContext);

  let { validRoles, component: Component, layout: Layout, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!keycloakWrapper?.keycloak?.authenticated) {
          // User is not logged in
          return <Redirect to="/" />;
        }

        if (!keycloakWrapper?.hasLoadedAllUserInfo) {
          // User data has not been loaded, can not yet determine if they have a role
          return <CircularProgress className="pageProgress" />;
        }

        if (!keycloakWrapper.hasSystemRole(validRoles)) {
          // User doesn't have the necessary role for this route
          if (keycloakWrapper.hasAccessRequest) {
            // User already has a pending access request
            return <Redirect to="/request-submitted" />;
          }

          return <Redirect to="/forbidden" />;
        }

        return (
          <Layout>
            <Component {...props} {...rest.componentProps} />
          </Layout>
        );
      }}
    />
  );
};

export default PrivateRoute;
