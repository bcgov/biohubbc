import { default as useCritterbaseUserWrapper } from 'hooks/useCritterbaseUserWrapper';
import useSimsUserWrapper, { ISimsUserWrapper } from 'hooks/useSimsUserWrapper';
import React from 'react';
import { AuthContextProps, useAuth } from 'react-oidc-context';

export interface IAuthState {
  /**
   * The logged in user's Keycloak information.
   *
   * @type {AuthContextProps}
   * @memberof IAuthState
   */
  auth: AuthContextProps;
  /**
   * The logged in user's SIMS user information.
   *
   * @type {ISimsUserWrapper}
   * @memberof IAuthState
   */
  simsUserWrapper: ISimsUserWrapper;
  /**
   * THe logged in user's Critterbase user information.
   *
   * @type {ReturnType<typeof useCritterbaseUserWrapper>}
   * @memberof IAuthState
   */
  critterbaseUserWrapper: ReturnType<typeof useCritterbaseUserWrapper>;
}

export const AuthStateContext = React.createContext<IAuthState | undefined>(undefined);

/**
 * Provides access to user and authentication (keycloak) data about the logged in user.
 *
 * @param {*} props
 * @return {*}
 */
export const AuthStateContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const auth = useAuth();

  const simsUserWrapper = useSimsUserWrapper();

  const critterbaseUserWrapper = useCritterbaseUserWrapper(simsUserWrapper);

  return (
    <AuthStateContext.Provider
      value={{
        auth,
        simsUserWrapper,
        critterbaseUserWrapper
      }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
