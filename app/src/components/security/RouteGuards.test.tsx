import { FeatureFlagGuard } from 'components/security/Guards';
import { AuthenticatedRouteGuard, SystemRoleRouteGuard } from 'components/security/RouteGuards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { createMemoryHistory } from 'history';
import { AuthContextProps } from 'react-oidc-context';
import { Router } from 'react-router';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import { cleanup, render, waitFor } from 'test-helpers/test-utils';

// Everything set to null, undefined, false, empty, etc
const nullAuthState = getMockAuthState({
  base: {
    auth: {
      isLoading: false,
      isAuthenticated: false,
      signinRedirect: () => {
        // do nothing
      }
    } as unknown as AuthContextProps,
    simsUserWrapper: {
      isLoading: false,
      systemUserId: undefined,
      userGuid: null,
      userIdentifier: undefined,
      displayName: undefined,
      email: undefined,
      agency: undefined,
      roleNames: [],
      identitySource: null,
      hasAccessRequest: false,
      hasOneOrMoreProjectRoles: false,
      refresh: () => {
        // do nothing
      }
    },
    critterbaseUserWrapper: {
      isLoading: false,
      critterbaseUserUuid: 'fakeguid'
    }
  }
});

const Fail = () => {
  throw new Error('Fail - This component should not have been rendered');
};

const Success = () => {
  return <div data-testid="success-component"></div>;
};

describe('RouteGuards', () => {
  describe('SystemRoleRouteGuard', () => {
    describe('loading', () => {
      afterAll(() => {
        cleanup();
      });

      it('renders a spinner if the auth context is still loading', async () => {
        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: true,
              isAuthenticated: true
            },
            simsUserWrapper: {
              isLoading: false
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const validRoles = [SYSTEM_ROLE.PROJECT_CREATOR];

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <SystemRoleRouteGuard validRoles={validRoles}>
                <Fail />
              </SystemRoleRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('system-role-guard-spinner')).toBeVisible();
        });
      });

      it('renders a spinner if the sims user is still loading', async () => {
        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true
            },
            simsUserWrapper: {
              isLoading: true
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const validRoles = [SYSTEM_ROLE.PROJECT_CREATOR];

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <SystemRoleRouteGuard validRoles={validRoles}>
                <Fail />
              </SystemRoleRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('system-role-guard-spinner')).toBeVisible();
          expect(history.location.pathname).toEqual(initialPath);
        });
      });
    });

    describe('authenticated', () => {
      afterAll(() => {
        cleanup();
      });

      it('redirects to the forbidden page if the user has insufficient system roles', async () => {
        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true
            },
            simsUserWrapper: {
              isLoading: false,
              roleNames: [SYSTEM_ROLE.PROJECT_CREATOR]
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const validRoles = [SYSTEM_ROLE.DATA_ADMINISTRATOR];

        render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <SystemRoleRouteGuard validRoles={validRoles}>
                <Fail />
              </SystemRoleRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        const expectedPath = '/forbidden';

        await waitFor(() => {
          expect(history.location.pathname).toEqual(expectedPath);
        });
      });

      it('redirects to the forbidden page if the user has no system roles', async () => {
        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true
            },
            simsUserWrapper: {
              isLoading: false,
              roleNames: []
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const validRoles = [SYSTEM_ROLE.DATA_ADMINISTRATOR];

        render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <SystemRoleRouteGuard validRoles={validRoles}>
                <Fail />
              </SystemRoleRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        const expectedPath = '/forbidden';

        await waitFor(() => {
          expect(history.location.pathname).toEqual(expectedPath);
        });
      });

      it('renders the route if no valid system roles specified', async () => {
        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true
            },
            simsUserWrapper: {
              isLoading: false,
              roleNames: []
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const validRoles: SYSTEM_ROLE[] = [];

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <SystemRoleRouteGuard validRoles={validRoles}>
                <Success />
              </SystemRoleRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(history.location.pathname).toEqual(initialPath);
          expect(getByTestId('success-component')).toBeVisible();
        });
      });

      it('renders the route if the user has sufficient system roles', async () => {
        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true
            },
            simsUserWrapper: {
              isLoading: false,
              roleNames: [SYSTEM_ROLE.DATA_ADMINISTRATOR]
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const validRoles = [SYSTEM_ROLE.DATA_ADMINISTRATOR];

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <SystemRoleRouteGuard validRoles={validRoles}>
                <Success />
              </SystemRoleRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(history.location.pathname).toEqual(initialPath);
          expect(getByTestId('success-component')).toBeVisible();
        });
      });
    });
  });

  describe('AuthenticatedRouteGuard', () => {
    describe('loading', () => {
      afterAll(() => {
        cleanup();
      });

      it('renders a spinner if the auth context is still loading', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: true,
              isAuthenticated: true,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: false
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Fail />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('authenticated-route-guard-spinner')).toBeVisible();
          expect(signinRedirectStub).toHaveBeenCalledTimes(0);
        });
      });

      it('renders a spinner if the sims user is still loading', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: true
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Fail />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('authenticated-route-guard-spinner')).toBeVisible();
          expect(history.location.pathname).toEqual(initialPath);
          expect(signinRedirectStub).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe('unauthenticated', () => {
      afterAll(() => {
        cleanup();
      });

      it('renders a spinner and calls `signinRedirect` if the user is not authenticated', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: false,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: false
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Fail />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('authenticated-route-guard-spinner')).toBeVisible();
          expect(history.location.pathname).toEqual(initialPath);
          expect(signinRedirectStub).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('authenticated', () => {
      afterAll(() => {
        cleanup();
      });

      it('redirects to the request submitted page if the user is not registered and has a pending access request', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: false,
              systemUserId: undefined, // not a registered user
              hasAccessRequest: true
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Success />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        const expectedPath = '/request-submitted';

        await waitFor(() => {
          expect(history.location.pathname).toEqual(expectedPath);
          expect(getByTestId('success-component')).toBeVisible();
          expect(signinRedirectStub).toHaveBeenCalledTimes(0);
        });
      });

      it('redirects to the forbidden page if the user is not registered, has no pending access request, and attempted to access a protected page', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: false,
              systemUserId: undefined, // not a registered user
              hasAccessRequest: false
            }
          }
        });

        const initialPath = '/admin/projects'; // protected route
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Fail />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        const expectedPath = '/forbidden';

        await waitFor(() => {
          expect(history.location.pathname).toEqual(expectedPath);
          expect(signinRedirectStub).toHaveBeenCalledTimes(0);
        });
      });

      it('renders the route if the user is not registered, has no pending access request, and attempted to access the landing page', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: false,
              systemUserId: undefined, // not a registered user
              hasAccessRequest: false
            }
          }
        });

        const initialPath = '/';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Success />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(history.location.pathname).toEqual(initialPath);
          expect(getByTestId('success-component')).toBeVisible();
          expect(signinRedirectStub).toHaveBeenCalledTimes(0);
        });
      });

      it('renders the route if the user is not registered, has no pending access request, and attempted to access the access request page', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: false,
              systemUserId: undefined, // not a registered user
              hasAccessRequest: false
            }
          }
        });

        const initialPath = '/access-request';
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Success />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(history.location.pathname).toEqual(initialPath);
          expect(getByTestId('success-component')).toBeVisible();
          expect(signinRedirectStub).toHaveBeenCalledTimes(0);
        });
      });

      it('renders the route if the user is a registered user', async () => {
        const signinRedirectStub = jest.fn();

        const authState = getMockAuthState({
          base: nullAuthState,
          overrides: {
            auth: {
              isLoading: false,
              isAuthenticated: true,
              signinRedirect: signinRedirectStub
            },
            simsUserWrapper: {
              isLoading: false,
              systemUserId: 1, // registered user
              hasAccessRequest: false
            }
          }
        });

        const initialPath = '/admin/projects'; // protected route
        const history = createMemoryHistory({ initialEntries: [initialPath] });

        const { getByTestId } = render(
          <AuthStateContext.Provider value={authState}>
            <Router history={history}>
              <AuthenticatedRouteGuard>
                <Success />
              </AuthenticatedRouteGuard>
            </Router>
          </AuthStateContext.Provider>
        );

        await waitFor(() => {
          expect(history.location.pathname).toEqual(initialPath);
          expect(getByTestId('success-component')).toBeVisible();
          expect(signinRedirectStub).toHaveBeenCalledTimes(0);
        });
      });
    });
  });

  describe('FeatureFlagGuard', () => {
    describe('feature flag guard specifies no flags', () => {
      afterAll(() => {
        cleanup();
      });

      it('renders the child component', async () => {
        const { getByTestId } = render(
          <ConfigContext.Provider
            value={
              {
                FEATURE_FLAGS: [] as string[]
              } as IConfig
            }>
            <FeatureFlagGuard featureFlags={[]} fallback={<Fail />}>
              <Success />
            </FeatureFlagGuard>
          </ConfigContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('success-component')).toBeVisible();
        });
      });
    });

    describe('feature flag guard specifies no matching flags', () => {
      afterAll(() => {
        cleanup();
      });

      it('renders the child component', async () => {
        const { getByTestId } = render(
          <ConfigContext.Provider
            value={
              {
                FEATURE_FLAGS: ['flag2', 'flag3']
              } as IConfig
            }>
            <FeatureFlagGuard featureFlags={['flag1']} fallback={<Fail />}>
              <Success />
            </FeatureFlagGuard>
          </ConfigContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('success-component')).toBeVisible();
        });
      });
    });

    describe('feature flag guard specifies a matching flag', () => {
      afterAll(() => {
        cleanup();
      });

      it('renders the fallback component', async () => {
        const { getByTestId } = render(
          <ConfigContext.Provider
            value={
              {
                FEATURE_FLAGS: ['flag1']
              } as IConfig
            }>
            <FeatureFlagGuard featureFlags={['flag1']} fallback={<Success />}>
              <Fail />
            </FeatureFlagGuard>
          </ConfigContext.Provider>
        );

        await waitFor(() => {
          expect(getByTestId('success-component')).toBeVisible();
        });
      });
    });
  });
});
