import useKeycloakWrapper, { IKeycloakWrapper } from 'hooks/useKeycloakWrapper';
import React from 'react';

export interface IAuthState {
  ready?: boolean;
  keycloakWrapper?: IKeycloakWrapper;
}

export const AuthStateContext = React.createContext<IAuthState>({
  ready: false
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloakWrapper = useKeycloakWrapper();

  return (
    <AuthStateContext.Provider
      value={{
        ready: keycloakWrapper.keycloak?.authenticated && keycloakWrapper.hasLoadedUserRelevantInfo,
        keycloakWrapper
      }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
