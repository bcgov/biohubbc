import { AxiosInstance } from 'axios';
import { IEnvironmentStandards, ISpeciesStandards, IMethodStandard } from 'interfaces/useStandardsApi.interface';

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
     * @return {*}  {Promise<IGetMethodsStandardsResponse>}
     */
    const getMethodStandards = async (): Promise<IMethodStandard[]> => {
      const { data } = await axios.get(`/api/standards/methods`);
  
      return data;
    };
  
        /**
     * Fetch environment standards
     *
     * @return {*}  {Promise<IGetEnvironmentStandardsResponse>}
     */
        const getEnvironmentStandards = async (): Promise<IEnvironmentStandards> => {
          const { data } = await axios.get(`/api/standards/environment`);
      
          return data;
        };
      

  return {
    getSpeciesStandards,
    getEnvironmentStandards,
    getMethodStandards
  };
};

export default useStandardsApi;
