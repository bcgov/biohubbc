import { AxiosInstance } from 'axios';
import {
  CBMeasurementSearchByTermResponse,
  CBMeasurementSearchByTsnResponse
} from 'interfaces/useCritterApi.interface';

export const useXrefApi = (axios: AxiosInstance) => {
  /**
   * Get measurement definitions by itis tsn.
   *
   * @param {number} itis_tsn
   * @return {*}  {Promise<CBMeasurementSearchByTsnResponse>}
   */
  const getTaxonMeasurements = async (itis_tsn: number): Promise<CBMeasurementSearchByTsnResponse> => {
    const { data } = await axios.get(`/api/critterbase/xref/taxon-measurements?tsn=${itis_tsn}`);
    return data;
  };

  /**
   * Get measurement definitions by search term.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<CBMeasurementSearchByTermResponse>}
   */
  const getMeasurementTypeDefinitionsBySearchTerm = async (
    searchTerm: string
  ): Promise<CBMeasurementSearchByTermResponse> => {
    const { data } = await axios.get(`/api/critterbase/xref/taxon-measurements/search?name=${searchTerm}`);
    return data;
  };

  return {
    getTaxonMeasurements,
    getMeasurementTypeDefinitionsBySearchTerm
  };
};
