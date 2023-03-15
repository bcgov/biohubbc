import axios from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
import useAdminApi from './api/useAdminApi';
import useAxios from './api/useAxios';
import useCodesApi from './api/useCodesApi';
import useDraftApi from './api/useDraftApi';
import useExternalApi from './api/useExternalApi';
import useObservationApi from './api/useObservationApi';
import useProjectApi from './api/useProjectApi';
import usePublishApi from './api/usePublishApi';
import useResourcesApi from './api/useResourcesApi';
import useSearchApi from './api/useSearchApi';
import useSurveyApi from './api/useSurveyApi';
import useTaxonomyApi from './api/useTaxonomyApi';
import useUserApi from './api/useUserApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useBiohubApi = () => {
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.API_HOST);

  const project = useProjectApi(apiAxios);

  const search = useSearchApi(apiAxios);

  const taxonomy = useTaxonomyApi(apiAxios);

  const survey = useSurveyApi(apiAxios);

  const codes = useCodesApi(apiAxios);

  const draft = useDraftApi(apiAxios);

  const user = useUserApi(apiAxios);

  const admin = useAdminApi(apiAxios);

  const observation = useObservationApi(apiAxios);

  const resources = useResourcesApi(apiAxios);

  const external = useExternalApi(axios);

  const publish = usePublishApi(apiAxios);

  return {
    project,
    search,
    taxonomy,
    survey,
    observation,
    resources,
    codes,
    draft,
    user,
    admin,
    external,
    publish
  };
};
