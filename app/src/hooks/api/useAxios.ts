import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { useMemo, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { ensureProtocol } from 'utils/Utils';

export class APIError extends Error {
  status: number;
  errors?: (string | object)[];
  requestURL?: string;

  constructor(error: AxiosError) {
    super(error.response?.data?.message || error.message);

    this.name = error.response?.data?.name || error.name;
    this.status = error.response?.data?.status || error.response?.status;
    this.errors = error.response?.data?.errors || [];

    this.requestURL = `${error?.config?.baseURL}${error?.config?.url}`;
  }
}

// Max allowed refresh/re-send attempts when a request fails due to a 401 or 403 error
const AXIOS_AUTH_REFRESH_ATTEMPTS_MAX = Number(process.env.REACT_APP_AXIOS_AUTH_REFRESH_ATTEMPTS_MAX) || 1;

/**
 * Returns an instance of axios with baseURL and authorization headers set.
 *
 * @return {*} {AxiosInstance} an instance of axios
 */
const useAxios = (baseUrl?: string): AxiosInstance => {
  const auth = useAuth();

  // Track how many times its been attempted to refresh the token and re-send the failed request in order to prevent
  // the possibility of an infinite loop (in the case where the token is unable to ever successfully refresh).
  const authRefreshAttemptsRef = useRef(0);

  return useMemo(() => {
    const instance = axios.create({
      headers: {
        Authorization: `Bearer ${auth?.user?.access_token}`
      },
      // Note: axios requires that the baseURL include a protocol (http:// or https://)
      baseURL: baseUrl && ensureProtocol(baseUrl)
    });

    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        authRefreshAttemptsRef.current = 0;

        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          // Error is unrelated to an expiring token, throw original error
          throw new APIError(error);
        }

        if (authRefreshAttemptsRef.current >= AXIOS_AUTH_REFRESH_ATTEMPTS_MAX) {
          // Too many token refresh attempts, throw original error
          throw new APIError(error);
        }

        authRefreshAttemptsRef.current++;

        // Attempt to refresh the keycloak token
        // Note: updateToken called with an arbitrarily large number of seconds to guarantee the update is executed
        const user = await auth.signinSilent();

        if (!user) {
          // Token was not refreshed successfully, throw original error
          throw new APIError(error);
        }

        // Token was successfully refreshed, re-send last failed request with new token
        return instance.request({
          ...error.config,
          headers: {
            ...error.config.headers,
            Authorization: `Bearer ${user?.access_token}`
          }
        });
      }
    );

    return instance;
  }, [auth, baseUrl]);
};

export default useAxios;
