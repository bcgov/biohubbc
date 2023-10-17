import CircularProgress from '@mui/material/CircularProgress';
import { AuthStateContext } from 'contexts/authStateContext';
import useRedirect from 'hooks/useRedirect';
import { useContext, useEffect } from 'react';

const LoginPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const { redirectUri } = useRedirect('/');

  useEffect(() => {
    console.log('-----------------------------------------------');
    switch (keycloakWrapper?.keycloak.activeNavigator) {
      default:
        console.log(keycloakWrapper?.keycloak.activeNavigator);
    }
    keycloakWrapper?.getLoginUrl(redirectUri);
  }, []);

  return <CircularProgress className="pageProgress" />;
};

export default LoginPage;
