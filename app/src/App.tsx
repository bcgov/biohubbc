import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
// TODO safe to remove this?
// import type {} from '@mui/material/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import AppRouter from 'AppRouter';
import { AuthStateContextProvider } from 'contexts/authStateContext';
import { ConfigContext, ConfigContextProvider } from 'contexts/configContext';
import React from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { BrowserRouter } from 'react-router-dom';
import appTheme from 'themes/appTheme';
import { buildUrl } from 'utils/Utils';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <ConfigContextProvider>
        <ConfigContext.Consumer>
          {(config) => {
            if (!config) {
              return <CircularProgress className="pageProgress" size={40} />;
            }

            // const keycloak = new Keycloak(config.KEYCLOAK_CONFIG);

            console.log(buildUrl(window.location.origin));

            const authConfig: AuthProviderProps = {
              authority: 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/',
              client_id: config.KEYCLOAK_CONFIG.clientId || '',
              redirect_uri: buildUrl(window.location.origin),
              loadUserInfo: true,
              onRemoveUser: () => {
                console.log('REMOVE USER!!');
              }
            };

            console.log(authConfig);

            return (
              <AuthProvider {...authConfig}>
                <AuthStateContextProvider>
                  <BrowserRouter>
                    <AppRouter />
                  </BrowserRouter>
                </AuthStateContextProvider>
              </AuthProvider>
            );
          }}
        </ConfigContext.Consumer>
      </ConfigContextProvider>
    </ThemeProvider>
  );
};

export default App;
