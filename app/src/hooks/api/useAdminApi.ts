import { AxiosInstance } from 'axios';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useAdminApi = (axios: AxiosInstance) => {
  /**
   * Get user access requests
   *
   * // TODO update response interface
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetAccessRequestsListResponse>}
   */
  const getAccessRequests = async (): Promise<IGetAccessRequestsListResponse[]> => {
    const { data } = await axios.get(`/api/administrative-activities`, {
      params: { type: 'System Access' },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  return {
    getAccessRequests
  };
};

export default useAdminApi;
