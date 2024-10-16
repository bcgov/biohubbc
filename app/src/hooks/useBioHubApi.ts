import axios from 'axios';
import useReferenceApi from 'hooks/api/useReferenceApi';
import { useConfigContext } from 'hooks/useContext';
import { useMemo } from 'react';
import useAdminApi from './api/useAdminApi';
import { useAlertApi } from './api/useAlertApi';
import useAnalyticsApi from './api/useAnalyticsApi';
import useAnimalApi from './api/useAnimalApi';
import useAxios from './api/useAxios';
import useCodesApi from './api/useCodesApi';
import useExternalApi from './api/useExternalApi';
import useFundingSourceApi from './api/useFundingSourceApi';
import useObservationApi from './api/useObservationApi';
import useProjectApi from './api/useProjectApi';
import useProjectParticipationApi from './api/useProjectParticipationApi';
import usePublishApi from './api/usePublishApi';
import useResourcesApi from './api/useResourcesApi';
import useSamplingSiteApi from './api/useSamplingSiteApi';
import useSpatialApi from './api/useSpatialApi';
import useStandardsApi from './api/useStandardsApi';
import useSurveyApi from './api/useSurveyApi';
import useTaxonomyApi from './api/useTaxonomyApi';
import useTechniqueApi from './api/useTechniqueApi';
import useTelemetryApi from './api/useTelemetryApi';
import useUserApi from './api/useUserApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useBiohubApi = () => {
  const config = useConfigContext();
  const apiAxios = useAxios(config.API_HOST);

  const analytics = useAnalyticsApi(apiAxios);

  const project = useProjectApi(apiAxios);

  const projectParticipants = useProjectParticipationApi(apiAxios);

  const taxonomy = useTaxonomyApi();

  const survey = useSurveyApi(apiAxios);

  const codes = useCodesApi(apiAxios);

  const user = useUserApi(apiAxios);

  const admin = useAdminApi(apiAxios);

  const observation = useObservationApi(apiAxios);

  const resources = useResourcesApi(apiAxios);

  const external = useExternalApi(axios);

  const publish = usePublishApi(apiAxios);

  const spatial = useSpatialApi(apiAxios);

  const funding = useFundingSourceApi(apiAxios);

  const samplingSite = useSamplingSiteApi(apiAxios);

  const technique = useTechniqueApi(apiAxios);

  const standards = useStandardsApi(apiAxios);

  const reference = useReferenceApi(apiAxios);

  const animal = useAnimalApi(apiAxios);

  const telemetry = useTelemetryApi(apiAxios);

  const alert = useAlertApi(apiAxios);

  return useMemo(
    () => ({
      analytics,
      project,
      projectParticipants,
      taxonomy,
      survey,
      observation,
      resources,
      codes,
      animal,
      user,
      admin,
      external,
      publish,
      spatial,
      technique,
      funding,
      samplingSite,
      standards,
      reference,
      telemetry,
      alert
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiAxios]
  );
};
