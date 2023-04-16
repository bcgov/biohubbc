import CircularProgress from '@material-ui/core/CircularProgress';
import { ThemeProvider } from '@material-ui/core/styles';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { KeycloakProvider } from '@react-keycloak/web';
import AppRouter from 'AppRouter';
import { AuthStateContextProvider } from 'contexts/authStateContext';
import { ConfigContext, ConfigContextProvider } from 'contexts/configContext';
import Keycloak from 'keycloak-js';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import appTheme from 'themes/appTheme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <ConfigContextProvider>
        <ConfigContext.Consumer>
          {(config) => {
            if (!config) {
              return <CircularProgress className="pageProgress" size={40} />;
            }

            const keycloak = Keycloak(config.KEYCLOAK_CONFIG);

            return (
              <KeycloakProvider
                initConfig={{ pkceMethod: 'S256' }}
                keycloak={keycloak}
                LoadingComponent={<CircularProgress className="pageProgress" size={40} />}>
                <AuthStateContextProvider>
                  <BrowserRouter>
                    <AppRouter />
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
