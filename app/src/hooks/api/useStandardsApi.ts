import { AxiosInstance } from 'axios';
import { IEnvironmentStandards, IMethodStandard, ISpeciesStandards } from 'interfaces/useStandardsApi.interface';

/**
 * Returns information about what data can be uploaded for a given species,
 * consolidating lookup values into a single endpoint
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useStandardsApi = (axios: AxiosInstance) => {
  /**
   * Fetch species standards
   *
   * @return {*}  {Promise<ISpeciesStandards>}
   */
  const getSpeciesStandards = async (tsn: number): Promise<ISpeciesStandards> => {
    const { data } = await axios.get(`/api/standards/taxon/${tsn}`);

    return data;
  };

  /**
   * Fetch method standards
   *
   * @param {string} keyword
   * @return {*}  {Promise<IGetMethodsStandardsResponse>}
   */
  const getMethodStandards = async (keyword?: string): Promise<IMethodStandard[]> => {
    let url = '/api/standards/methods';

    if (keyword) {
      url += `?keyword=${keyword}`;
    }

    const { data } = await axios.get(url);

    return data;
  };

  /**
   * Fetch environment standards
   *
   * @param {string} keyword
   * @return {*}  {Promise<IEnvironmentStandards>}
   */
  const getEnvironmentStandards = async (keyword?: string): Promise<IEnvironmentStandards> => {
    let url = '/api/standards/environment';

    if (keyword) {
      url += `?keyword=${keyword}`;
    }

    const { data } = await axios.get(url);

    return data;
  };

  return {
    getSpeciesStandards,
    getEnvironmentStandards,
    getMethodStandards
  };
};

export default useStandardsApi;
