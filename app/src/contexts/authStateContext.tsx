import useKeycloakWrapper, { IKeycloakWrapper } from 'hooks/useKeycloakWrapper';
import React from 'react';

export interface IAuthState {
  keycloakWrapper?: IKeycloakWrapper;
}

export const AuthStateContext = React.createContext<IAuthState>({
  keycloakWrapper: undefined
});

export const AuthStateContextProvider: React.FC = (props) => {
  const keycloakWrapper = useKeycloakWrapper();

  return (
    <AuthStateContext.Provider
      value={{
        keycloakWrapper
      }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
