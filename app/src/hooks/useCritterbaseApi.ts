// import axios from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAxios from './api/useAxios';
import { useMarkings } from './cb_api/useMarkings';
import { useAuthentication } from './cb_api/useAuthentication';

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
  return {
    markings,
    authentication
  };
};
