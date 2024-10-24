import { AxiosInstance } from 'axios';
import { EnvironmentType, IGetTechniqueAttributes } from 'interfaces/useReferenceApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with reference data.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useReferenceApi = (axios: AxiosInstance) => {
  /**
   * Finds subcount environments by search term.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<EnvironmentType>}
   */
  const findSubcountEnvironments = async (searchTerm: string): Promise<EnvironmentType> => {
    const { data } = await axios.get(`/api/reference/search/environment?searchTerm=${searchTerm}`);

    return data;
  };

  /**
   * Get attributes available for a method_lookup_id
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<IGetTechniqueAttributes[]>}
   */
  const getTechniqueAttributes = async (methodLookupIds: number[]): Promise<IGetTechniqueAttributes[]> => {
    const { data } = await axios.get('/api/reference/get/technique-attribute', {
      params: { methodLookupId: methodLookupIds },
      paramsSerializer: (params: any) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  return {
    findSubcountEnvironments,
    getTechniqueAttributes
  };
};

export default useReferenceApi;
