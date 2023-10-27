import { default as useCritterbaseUserWrapper } from 'hooks/useCritterbaseUserWrapper';
import useSimsUserWrapper, { ISimsUserWrapper } from 'hooks/useSimsUserWrapper';
import React from 'react';
import { AuthContextProps, useAuth } from 'react-oidc-context';

export interface IAuthState {
  isReady: boolean;
  auth: AuthContextProps;
  simsUserWrapper: ISimsUserWrapper;
  critterbaseUserWrapper: ReturnType<typeof useCritterbaseUserWrapper>;
}

export const AuthStateContext = React.createContext<IAuthState | undefined>(undefined);

export const AuthStateContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const auth = useAuth();

  const simsUserWrapper = useSimsUserWrapper();

  const critterbaseUserWrapper = useCritterbaseUserWrapper(simsUserWrapper);

  const isReady = !auth.isLoading;

  return (
    <AuthStateContext.Provider
      value={{
        isReady,
        auth,
        simsUserWrapper,
        critterbaseUserWrapper
      }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
