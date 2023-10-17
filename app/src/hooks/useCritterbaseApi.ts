import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAxios from './api/useAxios';
import { useAuthentication } from './cb_api/useAuthenticationApi';
import { useFamilyApi } from './cb_api/useFamilyApi';
import { useLookupApi } from './cb_api/useLookupApi';
import { useMarkings } from './cb_api/useMarkings';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useCritterbaseApi = () => {
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.API_HOST);
  const markings = useMarkings(apiAxios);
  const authentication = useAuthentication(apiAxios);
  const lookup = useLookupApi(apiAxios);
  const family = useFamilyApi(apiAxios);
  return {
    markings,
    authentication,
    lookup,
    family
  };
};
