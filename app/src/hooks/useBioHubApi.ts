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

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useBiohubApi = () => {
  const customAxios = useAxios();

  const project = useProjectApi(customAxios);

  const search = useSearchApi(customAxios);

  const survey = useSurveyApi(customAxios);

  const codes = useCodesApi(customAxios);

  const draft = useDraftApi(customAxios);

  const user = useUserApi(customAxios);

  const admin = useAdminApi(customAxios);

  const external = useExternalApi(axios);

  return {
    project,
    search,
    survey,
    codes,
    draft,
    user,
    admin,
    external
  };
};
