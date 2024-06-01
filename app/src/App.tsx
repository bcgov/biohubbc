import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import AppRouter from 'AppRouter';
import { AuthStateContext, AuthStateContextProvider } from 'contexts/authStateContext';
import { ConfigContext, ConfigContextProvider } from 'contexts/configContext';
import { WebStorageStateStore } from 'oidc-client-ts';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { BrowserRouter } from 'react-router-dom';
import appTheme from 'themes/appTheme';
import ScrollToTop from 'utils/ScrollToTop';
import { buildUrl } from 'utils/Utils';

const App = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <ConfigContextProvider>
        <ConfigContext.Consumer>
          {(config) => {
            if (!config) {
              return <CircularProgress className="pageProgress" size={40} />;
            }

            const logoutRedirectUri = config.SITEMINDER_LOGOUT_URL
              ? `${config.SITEMINDER_LOGOUT_URL}?returl=${window.location.origin}&retnow=1`
              : buildUrl(window.location.origin);

            const authConfig: AuthProviderProps = {
              authority: `${config.KEYCLOAK_CONFIG.authority}/realms/${config.KEYCLOAK_CONFIG.realm}/`,
              client_id: config.KEYCLOAK_CONFIG.clientId,
              resource: config.KEYCLOAK_CONFIG.clientId,
              // Default sign in redirect
              redirect_uri: buildUrl(window.location.origin),
              // Default sign out redirect
              post_logout_redirect_uri: logoutRedirectUri,
              // Automatically load additional user profile information
              loadUserInfo: true,
              userStore: new WebStorageStateStore({ store: window.localStorage }),
              onSigninCallback: (_): void => {
                // See https://github.com/authts/react-oidc-context#getting-started
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
                          <ScrollToTop />
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
