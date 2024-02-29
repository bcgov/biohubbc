import { useConfigContext } from 'hooks/useContext';
import useAxios from './api/useAxios';
import { useAuthentication } from './cb_api/useAuthenticationApi';
import { useCritterApi } from './cb_api/useCritterApi';
import { useFamilyApi } from './cb_api/useFamilyApi';
import { useLookupApi } from './cb_api/useLookupApi';
import { useMarkings } from './cb_api/useMarkings';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useCritterbaseApi = () => {
  const config = useConfigContext();
  const apiAxios = useAxios(config?.API_HOST);
  const critters = useCritterApi(apiAxios);
  const markings = useMarkings(apiAxios);
  const authentication = useAuthentication(apiAxios);
  const lookup = useLookupApi(apiAxios);
  const family = useFamilyApi(apiAxios);
  return {
    critters,
    markings,
    authentication,
    lookup,
    family
  };
};
