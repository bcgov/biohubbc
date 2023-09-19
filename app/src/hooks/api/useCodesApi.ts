import { AxiosInstance } from 'axios';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useCodesApi = (axios: AxiosInstance) => {
  /**
   * Fetch all code sets.
   *
   * @return {*}  {Promise<IGetAllCodeSetsResponse>}
   */
  const getAllCodeSets = async (): Promise<IGetAllCodeSetsResponse> => {
    const { data } = await axios.get('/api/codes/');

    data.sample_methods = [
      {
        id: 1,
        name: 'Camera Trap'
      },
      {
        id: 2,
        name: 'Electro Fishing'
      },
      {
        id: 3,
        name: 'Dip Net'
      },
      {
        id: 4,
        name: 'Box Trap'
      }
    ];
    return data;
  };

  return {
    getAllCodeSets
  };
};

export default useCodesApi;
