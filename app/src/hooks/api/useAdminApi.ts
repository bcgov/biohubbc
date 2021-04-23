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
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetAccessRequestsListResponse>}
   */
  const getAccessRequests = async (userIdentifier?: string): Promise<IGetAccessRequestsListResponse[]> => {
    const { data } = await axios.get(`/api/administrative-activities`, {
      params: { type: 'System Access', userIdentifier },
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
