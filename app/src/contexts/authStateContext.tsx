import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import React from 'react';

export interface IAuthState {
  ready?: boolean;
}

export const AuthStateContext = React.createContext<IAuthState>({
  ready: false
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloakWrapper = useKeycloakWrapper();

  return (
    <AuthStateContext.Provider
      value={{ ready: keycloakWrapper.keycloak?.authenticated && keycloakWrapper.hasLoadedUserRelevantInfo }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
