import { ReactKeycloakProvider } from '@react-keycloak/web';
import { renderHook } from '@testing-library/react-hooks';
import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Keycloak, { KeycloakPromise } from 'keycloak-js';
import { PropsWithChildren } from 'react';
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

describe('useAxios', () => {
  /// Mock `axios` instance
  let axiosMock: MockAdapter;

  // Stub `Keycloak.updateToken` function to return `true`
  const updateTokenStub = jest.fn();

  // Mock `Keycloak` instance
  const keycloakMock: Keycloak = {
    authenticated: true,
    token: 'a token',
    init: () => Promise.resolve(true) as KeycloakPromise<any, any>,
    createLoginUrl: () => '',
    createLogoutUrl: () => 'string',
    createRegisterUrl: () => 'string',
    createAccountUrl: () => 'string',
    isTokenExpired: () => false,
    updateToken: updateTokenStub,
    clearToken: () => null,
    hasRealmRole: () => true,
    hasResourceRole: () => true,
    loadUserInfo: () => {}
  } as unknown as Keycloak;

  beforeEach(() => {
    axiosMock = new MockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.restore();
  });

  it('should make an http get request and return the response', async () => {
    axiosMock.onAny().reply(200, { value: 'test value' });

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ReactKeycloakProvider authClient={keycloakMock}>{children}</ReactKeycloakProvider>
      )
    });

    const response = await result.current.get('/some/url');

    expect(response.status).toEqual(200);
    expect(response.data).toEqual({ value: 'test value' });
  });

  it('should retry once if the call fails with a 403', async () => {
    // Simulate `updateToken` call success
    updateTokenStub.mockResolvedValue(true);

    axiosMock.onAny().replyOnce(403).onAny().replyOnce(200, { value: 'test value' });

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ReactKeycloakProvider authClient={keycloakMock}>{children}</ReactKeycloakProvider>
      )
    });

    const response = await result.current.get('/some/url');

    expect(updateTokenStub).toHaveBeenCalledTimes(1);
    expect(updateTokenStub).toHaveBeenCalledWith(86400);

    expect(axiosMock.history['get'].length).toEqual(2);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual({ value: 'test value' });
  });

  it('should retry once if the call fails with a 401', async () => {
    // Simulate `updateToken` call success
    updateTokenStub.mockResolvedValue(true);

    // Return 401 once
    axiosMock.onAny().replyOnce(401).onAny().replyOnce(200, { value: 'test value' });

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ReactKeycloakProvider authClient={keycloakMock}>{children}</ReactKeycloakProvider>
      )
    });

    const response = await result.current.get('/some/url');

    expect(updateTokenStub).toHaveBeenCalledTimes(1);
    expect(updateTokenStub).toHaveBeenCalledWith(86400);

    expect(axiosMock.history['get'].length).toEqual(2);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual({ value: 'test value' });
  });

  it('should retry once and fail if the call continues to return 403', async () => {
    // Simulate `updateToken` call success
    updateTokenStub.mockResolvedValue(true);

    // Return 401 always
    axiosMock.onAny().reply(403);

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ReactKeycloakProvider authClient={keycloakMock}>{children}</ReactKeycloakProvider>
      )
    });

    try {
      await result.current.get('/some/url');
    } catch (actualError) {
      expect((actualError as APIError).status).toEqual(403);

      expect(axiosMock.history['get'].length).toEqual(2);

      expect(updateTokenStub).toHaveBeenCalledTimes(1);
      expect(updateTokenStub).toHaveBeenCalledWith(86400);
    }
  });

  it('should retry once and fail if the call continues to return 401', async () => {
    // Simulate `updateToken` call success
    updateTokenStub.mockResolvedValue(true);

    // Return 401 always
    axiosMock.onAny().reply(401);

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ReactKeycloakProvider authClient={keycloakMock}>{children}</ReactKeycloakProvider>
      )
    });

    try {
      await result.current.get('/some/url');
    } catch (actualError) {
      expect((actualError as APIError).status).toEqual(401);

      expect(axiosMock.history['get'].length).toEqual(2);

      expect(updateTokenStub).toHaveBeenCalledTimes(1);
      expect(updateTokenStub).toHaveBeenCalledWith(86400);
    }
  });

  it('should retry once and fail if the update token call fails', async () => {
    // Simulate `updateToken` call failure
    updateTokenStub.mockResolvedValue(false);

    // Return 403 once
    axiosMock.onAny().replyOnce(403).onAny().replyOnce(200, { value: 'test value' });

    const baseUrl = 'http://baseurl.com';

    // Render the `useAxios` hook with necessary keycloak parent components
    const { result } = renderHook(() => useAxios(baseUrl), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ReactKeycloakProvider authClient={keycloakMock}>{children}</ReactKeycloakProvider>
      )
    });

    try {
      await result.current.get('/some/url');
    } catch (actualError) {
      expect((actualError as APIError).status).toEqual(403);

      expect(axiosMock.history['get'].length).toEqual(1);

      expect(updateTokenStub).toHaveBeenCalledTimes(1);
      expect(updateTokenStub).toHaveBeenCalledWith(86400);
    }
  });
});
