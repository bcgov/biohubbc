import { getMockAuthState, SystemUserAuthState, UnauthenticatedUserAuthState } from 'test-helpers/auth-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';
import { AuthStateContext } from './authStateContext';

describe('AuthStateContext', () => {
  afterAll(() => {
    cleanup();
  });

  it('renders with default value', async () => {
    const captureAuthStateValue = jest.fn();

    const authState = getMockAuthState({ base: UnauthenticatedUserAuthState });

    render(
      <AuthStateContext.Provider value={authState}>
        <AuthStateContext.Consumer>
          {(value) => {
            captureAuthStateValue(value);
            return <></>;
          }}
        </AuthStateContext.Consumer>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(captureAuthStateValue).toHaveBeenCalledWith(authState);
    });
  });

  it('renders with provided value', () => {
    const captureAuthStateValue = jest.fn();

    const authState = getMockAuthState({ base: SystemUserAuthState });

    render(
      <AuthStateContext.Provider value={authState}>
        <AuthStateContext.Consumer>
          {(value) => {
            captureAuthStateValue(value);
            return <></>;
          }}
        </AuthStateContext.Consumer>
      </AuthStateContext.Provider>
    );

    expect(captureAuthStateValue).toHaveBeenCalledWith(authState);
  });
});
