import { DeviceInfo } from '@capacitor/core';
import { IonReactRouter } from '@ionic/react-router';
import { CircularProgress, createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core';
// Strange looking `type {}` import below, see: https://github.com/microsoft/TypeScript/issues/36812
import type {} from '@material-ui/lab/themeAugmentation'; // this allows `@material-ui/lab` components to be themed
import { KeycloakProvider } from '@react-keycloak/web';
import { DatabaseChangesContextProvider } from 'contexts/DatabaseChangesContext';
import Keycloak, { KeycloakConfig, KeycloakInstance } from 'keycloak-js';
import React from 'react';
import AppRouter from './AppRouter';
import { AuthStateContext, AuthStateContextProvider, IAuthState } from './contexts/authStateContext';
import { DatabaseContext, DatabaseContextProvider, IDatabaseContext } from './contexts/DatabaseContext';
import getKeycloakEventHandler from './utils/KeycloakEventHandler';

const theme = createMuiTheme({
  palette: {
    // https://material-ui.com/customization/palette/
    primary: {
      light: '#5469a4',
      main: '#223f75', // BC ID: corporate blue
      dark: '#001949',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#ffd95e',
      main: '#e3a82b', // BC ID: corporate gold
      dark: '#ad7900',
      contrastText: '#000000'
    }
  },
  overrides: {
    MuiTypography: {
      // https://material-ui.com/api/typography/
      h1: {
        fontSize: '3rem'
      },
      h2: {
        fontSize: '2.5rem'
      },
      h3: {
        fontSize: '2rem'
      },
      h4: {
        fontSize: '1.5rem'
      },
      h5: {
        fontSize: '1.25rem'
      },
      h6: {
        fontSize: '1rem'
      }
    },
    MuiCircularProgress: {
      // https://material-ui.com/api/circular-progress/
      root: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: '60px !important',
        width: '60px !important',
        marginLeft: '-30px',
        marginTop: '-30px'
      }
    },
    MuiContainer: {
      // https://material-ui.com/api/container/
      root: {
        maxWidth: 'xl'
      }
    }
  }
});

const useStyles = makeStyles(() => ({
  root: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    overflow: 'hidden'
  }
}));

interface IAppProps {
  deviceInfo: DeviceInfo;
}

const App: React.FC<IAppProps> = (props) => {
  const classes = useStyles();

  const keycloakConfig: KeycloakConfig = {
    realm: 'dfmlcg7z',
    url: 'https://dev.oidc.gov.bc.ca/auth/',
    clientId: 'biohub-bc'
  };

  //@ts-ignore
  const keycloak: KeycloakInstance = new Keycloak(keycloakConfig);

  let initConfig = null;

  if (window['cordova']) {
    initConfig = {
      ...initConfig,
      ...{
        flow: 'hybrid',
        redirectUri: 'http://127.0.0.1',
        checkLoginIframe: false,
        onLoad: 'login-required'
      }
    };
  } else {
    initConfig = { onLoad: 'login-required' };
  }

  return (
    <div className={classes.root}>
      <ThemeProvider theme={theme}>
        <KeycloakProvider
          keycloak={keycloak}
          initConfig={initConfig}
          LoadingComponent={<CircularProgress />}
          onEvent={getKeycloakEventHandler(keycloak)}>
          <AuthStateContextProvider>
            <IonReactRouter>
              <AuthStateContext.Consumer>
                {(context: IAuthState) => {
                  if (!context.ready) {
                    // authentication not ready, delay loading app
                    return <CircularProgress />;
                  }
                  return (
                    <DatabaseContextProvider>
                      <DatabaseContext.Consumer>
                        {(databaseContext: IDatabaseContext) => {
                          if (!databaseContext.database) {
                            // database not ready, delay loading app
                            return <CircularProgress />;
                          }
                          return (
                            <DatabaseChangesContextProvider>
                              <AppRouter />
                            </DatabaseChangesContextProvider>
                          );
                        }}
                      </DatabaseContext.Consumer>
                    </DatabaseContextProvider>
                  );
                }}
              </AuthStateContext.Consumer>
            </IonReactRouter>
          </AuthStateContextProvider>
        </KeycloakProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
