import { AxiosInstance } from 'axios';
import { IGetPermitsListResponse } from 'interfaces/usePermitApi.interface';

/**
 * Returns a set of supported api methods for working with permits as their own entities.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const usePermitApi = (axios: AxiosInstance) => {
  /**
   * Get a list of all permits
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetPermitsListResponse[]>}
   */
  const getPermitsList = async (): Promise<IGetPermitsListResponse[]> => {
    const { data } = await axios.get(`/api/permit/list`);

    return data;
  };

  return {
    getPermitsList
  };
};

export default usePermitApi;
