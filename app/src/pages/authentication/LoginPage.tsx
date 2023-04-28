import CircularProgress from '@material-ui/core/CircularProgress';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext, useEffect } from 'react';

const LoginPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  useEffect(() => {
    keycloakWrapper?.keycloak?.login();
  });

  return <CircularProgress className="pageProgress" />;
};

export default LoginPage
