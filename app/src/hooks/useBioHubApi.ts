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

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useBiohubApi = () => {
  const customAPIAxios = useAxios('api');
  const customN8NAxios = useAxios('n8n');

  const project = useProjectApi(customAPIAxios);

  const permit = usePermitApi(customAPIAxios);

  const search = useSearchApi(customAPIAxios);

  const survey = useSurveyApi(customAPIAxios);

  const codes = useCodesApi(customAPIAxios);

  const draft = useDraftApi(customAPIAxios);

  const user = useUserApi(customAPIAxios);

  const admin = useAdminApi(customAPIAxios);

  const observation = useObservationApi(customAPIAxios, customN8NAxios);

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
    external
  };
};
