import { useKeycloak } from '@react-keycloak/web';
import axios, { AxiosInstance } from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext, useMemo } from 'react';
import { ensureProtocol } from 'utils/Utils';

/**
 * Returns an instance of axios with baseURL and authorization headers set.
 *
 * @return {*} {AxiosInstance} an instance of axios
 */
const useAxios = (): AxiosInstance => {
  const { keycloak } = useKeycloak();

  const config = useContext(ConfigContext);

  return useMemo(() => {
    return axios.create({
      headers: {
        Authorization: `Bearer ${keycloak?.token}`
      },
      baseURL: config?.API_HOST && ensureProtocol(config.API_HOST)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, keycloak, keycloak?.token]);
};

export default useAxios;
