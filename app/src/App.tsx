import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import AppRouter from 'AppRouter';
import { AuthStateContext, AuthStateContextProvider } from 'contexts/authStateContext';
import { ConfigContext, ConfigContextProvider } from 'contexts/configContext';
import { WebStorageStateStore } from 'oidc-client-ts';
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

            const authConfig: AuthProviderProps = {
              authority: `${config.KEYCLOAK_CONFIG.authority}/realms/${config.KEYCLOAK_CONFIG.realm}/`,
              client_id: config.KEYCLOAK_CONFIG.clientId,
              redirect_uri: buildUrl(window.location.origin),
              post_logout_redirect_uri: buildUrl(window.location.origin),
              resource: config.KEYCLOAK_CONFIG.clientId,
              userStore: new WebStorageStateStore({ store: window.localStorage }),
              loadUserInfo: true,
              onSigninCallback: (_): void => {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            };

            return (
              <AuthProvider {...authConfig}>
                <AuthStateContextProvider>
                  <AuthStateContext.Consumer>
                    {(authState) => {
                      if (!authState) {
                        return <CircularProgress className="pageProgress" size={40} />;
                      }

                      return (
                        <BrowserRouter>
                          <AppRouter />
                        </BrowserRouter>
                      );
                    }}
                  </AuthStateContext.Consumer>
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
