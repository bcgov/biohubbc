import { cleanup, renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { User } from 'oidc-client-ts';
import { PropsWithChildren } from 'react';
import { AuthContextProps, AuthProvider, AuthProviderProps, useAuth } from 'react-oidc-context';
import { Mock } from 'vitest';
import useAxios, { APIError } from './useAxios';

describe('APIError', () => {
  it('assigns all values correctly', () => {
    const error = {
      name: 'error name',
      message: 'error message',
      response: { status: 500, data: { errors: ['some errors'] } },
      config: {
        baseURL: 'localhost',
        url: '/test'
      }
    } as Partial<AxiosError>;

    const apiError = new APIError(error as unknown as AxiosError);

    expect(apiError).not.toBe(null);

    expect(apiError.name).toEqual('error name');
    expect(apiError.message).toEqual('error message');
    expect(apiError.status).toEqual(500);
    expect(apiError.errors).toEqual(['some errors']);
    expect(apiError.requestURL).toEqual('localhost/test');
  });
});

vi.mock('react-oidc-context');

describe('useAxios', () => {
  /// Mock `axios` instance
  let axiosMock: MockAdapter;

  const authConfig: AuthProviderProps = {
    authority: 'authority',
    client_id: 'client',
    redirect_uri: 'redirect'
  };

  const mockAuthProvider = AuthProvider as Mock;
  const mockUseAuth = useAuth as Mock<() => Partial<AuthContextProps>>;

  const mockSigninSilent = vi.fn();

  beforeEach(() => {
    axiosMock = new MockAdapter(axios);

    // Assign the real implementation of `AuthProvider`
    const { AuthProvider } = vi.importActual('react-oidc-context') as any;
    mockAuthProvider.mockImplementation(AuthProvider);

    // Assign a mock implementation of `useAuth`
    mockUseAuth.mockImplementation(() => ({
      signinSilent: mockSigninSilent
    }));
  });

  afterEach(() => {
    axiosMock.restore();
    cleanup();
  });

  it('should make an http get request and return the response', async () => {
    axiosMock.onAny().reply(200, { value: 'test value' });

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => <AuthProvider {...authConfig}>{children}</AuthProvider>
    });

    await waitFor(async () => {
      const response = await result.current.get('/some/url');

      expect(response.status).toEqual(200);
      expect(response.data).toEqual({ value: 'test value' });
    });
  });

  it('should retry once if the call fails with a 401', async () => {
    // Simulate `signinSilent` call success
    mockSigninSilent.mockResolvedValue({} as unknown as User);

    // Return 401 once
    axiosMock.onAny().replyOnce(401).onAny().replyOnce(200, { value: 'test value' });

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => <AuthProvider {...authConfig}>{children}</AuthProvider>
    });

    await waitFor(async () => {
      const response = await result.current.get('/some/url');

      expect(mockSigninSilent).toHaveBeenCalledTimes(1);

      expect(axiosMock.history['get'].length).toEqual(2);

      expect(response.status).toEqual(200);
      expect(response.data).toEqual({ value: 'test value' });
    });
  });

  it('should retry once and fail if the call continues to return 401', async () => {
    // Simulate `signinSilent` call success
    mockSigninSilent.mockResolvedValue({} as unknown as User);

    // Return 401 always
    axiosMock.onAny().reply(401);

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => <AuthProvider {...authConfig}>{children}</AuthProvider>
    });

    await waitFor(async () => {
      try {
        await result.current.get('/some/url');
      } catch (actualError) {
        expect((actualError as APIError).status).toEqual(401);

        expect(axiosMock.history['get'].length).toEqual(2);

        expect(mockSigninSilent).toHaveBeenCalledTimes(1);
      }
    });
  });

  it('should retry once and fail if the update token call fails', async () => {
    // Simulate `signinSilent` call failure
    mockSigninSilent.mockResolvedValue(null);

    // Return 403 once
    axiosMock.onAny().replyOnce(401).onAny().replyOnce(200, { value: 'test value' });

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => <AuthProvider {...authConfig}>{children}</AuthProvider>
    });

    await waitFor(async () => {
      try {
        await result.current.get('/some/url');
      } catch (actualError) {
        expect((actualError as APIError).status).toEqual(401);

        expect(axiosMock.history['get'].length).toEqual(1);

        expect(mockSigninSilent).toHaveBeenCalledTimes(1);
      }
    });
  });
});
