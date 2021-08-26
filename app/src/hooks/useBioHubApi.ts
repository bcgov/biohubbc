import axios from 'axios';
import useAdminApi from './api/useAdminApi';
import useAxios from './api/useAxios';
import useCodesApi from './api/useCodesApi';
import useDraftApi from './api/useDraftApi';
import useExternalApi from './api/useExternalApi';
import useProjectApi from './api/useProjectApi';
import useSearchApi from './api/useSearchApi';
import useSurveyApi from './api/useSurveyApi';
import useUserApi from './api/useUserApi';
import usePermitApi from './api/usePermitApi';
import useObservationApi from './api/useObservationApi';
import { useContext } from 'react';
import { ConfigContext } from 'contexts/configContext';
import useN8NApi from './api/useN8NApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useBiohubApi = () => {
  const config = useContext(ConfigContext);

  const apiAxios = useAxios(config?.API_HOST);
  const n8nAxios = useAxios(config?.N8N_HOST);

  const project = useProjectApi(apiAxios);

  const permit = usePermitApi(apiAxios);

  const search = useSearchApi(apiAxios);

  const survey = useSurveyApi(apiAxios);

  const codes = useCodesApi(apiAxios);

  const draft = useDraftApi(apiAxios);

  const user = useUserApi(apiAxios);

  const admin = useAdminApi(apiAxios);

  const observation = useObservationApi(apiAxios);

  const n8n = useN8NApi(n8nAxios);

  const external = useExternalApi(axios);

  return {
    project,
    permit,
    search,
    survey,
    observation,
    codes,
    draft,
    user,
    admin,
    n8n,
    external
  };
};
