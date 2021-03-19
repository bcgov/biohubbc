import { KeycloakEventHandler } from '@react-keycloak/web';

const getKeycloakEventHandler = (): KeycloakEventHandler => {
  return (event: any, error: any) => {
    switch (event) {
      case 'onReady':
        console.log('keycloak onReady');
        break;
      case 'onAuthSuccess':
        console.log('keycloak onAuthSuccess');
        break;
      case 'onAuthError':
        console.log('keycloak onAuthError', error);
        break;
      case 'onAuthLogout':
        console.log('keycloak onAuthLogout');
        break;
      case 'onAuthRefreshError':
        console.log('keycloak onAuthRefreshError', error);
        break;
      case 'onAuthRefreshSuccess':
        console.log('keycloak onAuthRefreshSuccess');
        break;
      case 'onInitError':
        console.log('keycloak onInitError', error);
        break;
      case 'onTokenExpired':
        console.log('keycloak onTokenExpired', error);
        break;
      default:
        console.debug(`keycloak event: ${event} error ${error}`);
    }
  };
};

export default getKeycloakEventHandler;
