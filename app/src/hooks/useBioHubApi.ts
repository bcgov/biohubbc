import axios from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext, useMemo } from 'react';
import useAdminApi from './api/useAdminApi';
import useAxios from './api/useAxios';
import useCodesApi from './api/useCodesApi';
import useDraftApi from './api/useDraftApi';
import useExternalApi from './api/useExternalApi';
import useFundingSourceApi from './api/useFundingSourceApi';
import useObservationApi from './api/useObservationApi';
import useProjectApi from './api/useProjectApi';
import useProjectParticipationApi from './api/useProjectParticipationApi';
import usePublishApi from './api/usePublishApi';
import useResourcesApi from './api/useResourcesApi';
import useSamplingSiteApi from './api/useSamplingSiteApi';
import useSearchApi from './api/useSearchApi';
import useSpatialApi from './api/useSpatialApi';
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

  const projectParticipants = useProjectParticipationApi(apiAxios);

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

  const spatial = useSpatialApi(apiAxios);

  const funding = useFundingSourceApi(apiAxios);

  const samplingSite = useSamplingSiteApi(apiAxios);

  return useMemo(
    () => ({
      project,
      projectParticipants,
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
      publish,
      spatial,
      funding,
      samplingSite
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiAxios]
  );
};
