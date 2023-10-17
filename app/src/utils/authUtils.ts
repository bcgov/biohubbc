import { IKeycloakWrapper } from 'hooks/useKeycloakWrapper';

export const isAuthenticated = (keycloakWrapper: IKeycloakWrapper | undefined) => {
  if (
    !keycloakWrapper ||
    !keycloakWrapper.keycloak ||
    !keycloakWrapper.keycloak.isAuthenticated ||
    !keycloakWrapper.hasLoadedAllUserInfo
  ) {
    return false;
  }

  return true;
};
