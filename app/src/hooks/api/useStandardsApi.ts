import { AxiosInstance } from 'axios';
import { IGetSpeciesStandardsResponse } from 'interfaces/useStandardsApi.interface';

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
   * @return {*}  {Promise<IGetSpeciesStandardsResponse>}
   */
  const getSpeciesStandards = async (tsn: number): Promise<IGetSpeciesStandardsResponse> => {
    const { data } = await axios.get(`/api/standards/taxon/${tsn}`);

    return data;
  };

  return {
    getSpeciesStandards
  };
};

export default useStandardsApi;
