import { useKeycloak } from '@react-keycloak/web';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext, useMemo } from 'react';
import { ensureProtocol } from 'utils/Utils';

export class APIError {
  name: string;
  status: number;
  message: string;
  errors?: (string | object)[];
  requestURL?: string;
  responseURL?: string;

  constructor(error: AxiosError) {
    this.name = error.name;
    this.status = error?.response?.status || Number(error?.code) || 0;
    this.message = error.message;

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
const useAxios = (): AxiosInstance => {
  const { keycloak } = useKeycloak();

  const config = useContext(ConfigContext);

  return useMemo(() => {
    const instance = axios.create({
      headers: {
        Authorization: `Bearer ${keycloak?.token}`
      },
      baseURL: config?.API_HOST && ensureProtocol(config.API_HOST)
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
  }, [config, keycloak, keycloak?.token]);
};

export default useAxios;
