import { useKeycloak } from '@react-keycloak/web';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { useMemo } from 'react';
import { ensureProtocol } from 'utils/Utils';

export class APIError {
  name: string;
  status: number;
  message: string;
  errors?: (string | object)[];
  requestURL?: string;
  responseURL?: string;

  constructor(error: AxiosError) {
    this.name = error?.response?.data?.name || error.name;
    this.status = error?.response?.data?.status || error?.response?.status || Number(error?.code);
    this.message = error?.response?.data?.message || error.message;
    this.errors = error?.response?.data?.errors || [];

    this.requestURL = `${error?.config?.baseURL}${error?.config?.url}`;
    this.responseURL = error?.request?.responseURL;
  }
}

/**
 * Returns an instance of axios with baseURL and authorization headers set.
 *
 * @return {*} {AxiosInstance} an instance of axios
 */
const useAxios = (baseUrl?: string): AxiosInstance => {
  const { keycloak } = useKeycloak();

  return useMemo(() => {
    const instance = axios.create({
      headers: {
        Authorization: `Bearer ${keycloak?.token}`
      },
      baseURL: baseUrl && ensureProtocol(baseUrl)
    });

    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(new APIError(error));
      }
    );

    return instance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak, keycloak?.token]);
};

export default useAxios;
