import { AxiosInstance } from 'axios';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';

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
   * @return {*}  {Promise<{
   *     qualitative_environments: EnvironmentQualitativeTypeDefinition[];
   *     quantitative_environments: EnvironmentQuantitativeTypeDefinition[];
   *   }>}
   */
  const findSubcountEnvironments = async (
    searchTerm: string
  ): Promise<{
    qualitative_environments: EnvironmentQualitativeTypeDefinition[];
    quantitative_environments: EnvironmentQuantitativeTypeDefinition[];
  }> => {
    const { data } = await axios.get(`/api/reference/search/environment?searchTerm=${searchTerm}`);

    return data;
  };

  return {
    findSubcountEnvironments
  };
};

export default useReferenceApi;
