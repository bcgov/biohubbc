import { cleanup, render } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { getMockAuthState, UnauthenticatedUserAuthState } from 'test-helpers/auth-helpers';
import LoginPage from './LoginPage';

const history = createMemoryHistory();

describe('LoginPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('Should call keycloak login', async () => {
    const mockLoginFunction = jest.fn();

    const authState = getMockAuthState({
      base: UnauthenticatedUserAuthState,
      overrides: {
        keycloakWrapper: {
          keycloak: {
            login: () => {
              mockLoginFunction();
            }
          }
        }
      }
    });

    render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <LoginPage />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(mockLoginFunction).toBeCalled();
  });
});
