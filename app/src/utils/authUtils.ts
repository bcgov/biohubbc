import { IKeycloakWrapper } from 'hooks/useKeycloakWrapper';

export const isAuthenticated = (keycloakWrapper: IKeycloakWrapper | undefined) => {
  if (
    !keycloakWrapper ||
    !keycloakWrapper.keycloak ||
    !keycloakWrapper.keycloak.authenticated ||
    !keycloakWrapper.hasLoadedAllUserInfo
  ) {
    return false;
  }

  return true;
};
