import { Box, CircularProgress, ThemeProvider } from '@material-ui/core';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { KeycloakProvider } from '@react-keycloak/web';
import AppRouter from 'AppRouter';
import { AuthStateContext, AuthStateContextProvider, IAuthState } from 'contexts/authStateContext';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import appTheme from 'themes/appTheme';
import getKeycloakEventHandler from 'utils/KeycloakEventHandler';

const App: React.FC = () => {
  // const keycloakInstanceConfig: KeycloakConfig = {
  //   realm: 'dfmlcg7z',
  //   url: 'https://dev.oidc.gov.bc.ca/auth/',
  //   clientId: 'invasives-bc'
  // };

  //@ts-ignore
  const keycloak: KeycloakInstance = new Keycloak('/keycloak.json');

  return (
    <Box height="100vh" width="100vw" display="flex" overflow="hidden">
      <ThemeProvider theme={appTheme}>
        <KeycloakProvider
          keycloak={keycloak}
          initConfig={{ onLoad: 'login-required', checkLoginIframe: false }}
          LoadingComponent={<CircularProgress />}
          onEvent={getKeycloakEventHandler(keycloak)}>
          <AuthStateContextProvider>
            <BrowserRouter>
              <AuthStateContext.Consumer>
                {(context: IAuthState) => {
                  if (!context.ready) {
                    return <CircularProgress />;
                  }
                  return <AppRouter />;
                }}
              </AuthStateContext.Consumer>
            </BrowserRouter>
          </AuthStateContextProvider>
        </KeycloakProvider>
      </ThemeProvider>
    </Box>
  );
};

export default App;
