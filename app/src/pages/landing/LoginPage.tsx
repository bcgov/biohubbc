import CircularProgress from '@material-ui/core/CircularProgress';
import { AuthStateContext } from 'contexts/authStateContext';
import useRedirect from 'hooks/useRedirect';
import React, { useContext, useEffect } from 'react';

const LoginPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const { redirectUri } = useRedirect();

  useEffect(() => {
    keycloakWrapper?.keycloak?.login({ redirectUri });
  });

  return <CircularProgress className="pageProgress" />;
};

export default LoginPage
