import { AxiosInstance } from 'axios';
import { IGetBlocksListResponse } from 'interfaces/useBlockObservationApi.interface';

/**
 * Returns a set of supported api methods for working with blocks and observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useBlockObservationApi = (axios: AxiosInstance) => {
  /**
   * Get blocks list.
   *
   * @return {*}  {Promise<IGetBlocksListResponse[]>}
   */
  const getBlocksList = async (): Promise<IGetBlocksListResponse[]> => {
    const { data } = await axios.get(`/api/blocks`);

    return data;
  };

  return {
    getBlocksList
  };
};

export default useBlockObservationApi;
