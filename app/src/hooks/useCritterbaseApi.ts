import { useXrefApi } from 'hooks/cb_api/useXrefApi';
import { useConfigContext } from 'hooks/useContext';
import { useMemo } from 'react';
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
  const config = useConfigContext();
  const apiAxios = useAxios(config?.API_HOST);

  const markings = useMarkings(apiAxios);

  const authentication = useAuthentication(apiAxios);

  const lookup = useLookupApi(apiAxios);

  const family = useFamilyApi(apiAxios);

  const xref = useXrefApi(apiAxios);

  return useMemo(
    () => ({
      markings,
      authentication,
      lookup,
      family,
      xref
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiAxios]
  );
};
