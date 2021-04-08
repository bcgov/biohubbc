import { CircularProgress, ThemeProvider } from '@material-ui/core';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { KeycloakProvider } from '@react-keycloak/web';
import AppRouter from 'AppRouter';
import { AuthStateContext, AuthStateContextProvider, IAuthState } from 'contexts/authStateContext';
import { ConfigContext, ConfigContextProvider } from 'contexts/configContext';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import appTheme from 'themes/appTheme';
import getKeycloakEventHandler from 'utils/KeycloakEventHandler';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <ConfigContextProvider>
        <ConfigContext.Consumer>
          {(config) => {
            if (!config) {
              return <CircularProgress />;
            }

            //@ts-ignore
            const keycloak: KeycloakInstance = new Keycloak(config.KEYCLOAK_CONFIG);

            return (
              <KeycloakProvider
                keycloak={keycloak}
                initConfig={{ onLoad: 'login-required', checkLoginIframe: false }}
                LoadingComponent={<CircularProgress />}
                onEvent={getKeycloakEventHandler()}>
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
            );
          }}
        </ConfigContext.Consumer>
      </ConfigContextProvider>
    </ThemeProvider>
  );
};

export default App;
