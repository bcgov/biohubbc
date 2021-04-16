import useAxios from './api/useAxios';
import useProjectApi from './api/useProjectApi';
import useCodesApi from './api/useCodesApi';
import useDraftApi from './api/useDraftApi';
import useUserApi from './api/useUserApi';

/**
 * Returns a set of supported api methods.
 *
 * @return {*} object whose properties are supported api methods.
 */
export const useBiohubApi = () => {
  const axios = useAxios();

  const project = useProjectApi(axios);

  const codes = useCodesApi(axios);

  const draft = useDraftApi(axios);

  const user = useUserApi(axios);

  return {
    project,
    codes,
    draft,
    user
  };
};
