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

  // Add event listener for silent renew errors
  auth.events.addSilentRenewError(() => {
    // If the silent renew fails, ensure the user is signed out and redirect to the home page
    auth.signoutRedirect();
  });

  const simsUserWrapper = useSimsUserWrapper();

  return (
    <AuthStateContext.Provider
      value={{
        auth,
        simsUserWrapper
      }}>
      {props.children}
    </AuthStateContext.Provider>
  );
};
