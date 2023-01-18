import { AxiosInstance } from 'axios';
import { IListResourcesResponse } from 'interfaces/useResourcesApi.interface';

/**
 * Returns a list of all resources
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useResourcesApi = (axios: AxiosInstance) => {
  /**
   * Fetch all resources.
   *
   * @return {*}  {Promise<IListResourcesResponse>}
   */
  const listResources = async (): Promise<IListResourcesResponse> => {
    const { data } = await axios.get('/api/resources/list');

    return data;
  };

  return {
    listResources
  };
};

export default useResourcesApi;
