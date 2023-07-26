// import axios from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAxios from './api/useAxios';
import { useAuthentication } from './cb_api/useAuthenticationApi';
import { useLookupApi } from './cb_api/useLookupApi';
import { useMarkings } from './cb_api/useMarkingsApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useCritterbaseApi = () => {
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.CB_API_HOST);
  const markings = useMarkings(apiAxios);
  const authentication = useAuthentication(apiAxios);
  const lookup = useLookupApi(apiAxios);
  return {
    markings,
    authentication,
    lookup
  };
};
