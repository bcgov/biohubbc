import { useContext } from 'react';
import { AuthStateContext, IAuthState } from '../contexts/authStateContext';

/**
 * Returns an instance of `IAuthState` from `AuthStateContext`.
 *
 * @return {*}  {IAuthState}
 */
export const useAuthStateContext = (): IAuthState => {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw Error(
      'AuthStateContext is undefined, please verify you are calling useAuthStateContext() as child of an <AuthStateProvider> component.'
    );
  }

  return context;
};
