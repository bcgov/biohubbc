import * as React from 'react';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';

export interface IAuthState {
  ready?: boolean;
}

export const AuthStateContext = React.createContext<IAuthState>({
  ready: false
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloak = useKeycloakWrapper();

  return (
    <AuthStateContext.Provider value={{ ready: keycloak.obj?.authenticated }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
