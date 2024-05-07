import { AxiosInstance } from 'axios';
import {
  CBMeasurementSearchByTermResponse,
  CBMeasurementSearchByTsnResponse,
  ICollectionUnitResponse
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

  /**
   * Get collection (ie. ecological) units that are available for a given taxon
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<CBMeasurementSearchByTermResponse>}
   */
  const getCollectionUnits = async (tsn: number): Promise<ICollectionUnitResponse[]> => {
    const { data } = await axios.get(`/api/critterbase/xref/taxon-collection-categories?tsn=${tsn}`);
    return data;
  };

  /**
   * Get collection (ie. ecological) units that are available for a given taxon
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<CBMeasurementSearchByTermResponse>}
   */
  const getCollectionUnitOptions = async (unit_id: string): Promise<ICollectionUnitResponse[]> => {
    const { data } = await axios.get(`/api/critterbase/xref/collection-units/${unit_id}`);
    return data;
  };

  return {
    getTaxonMeasurements,
    getMeasurementTypeDefinitionsBySearchTerm,
    getCollectionUnits,
    getCollectionUnitOptions
  };
};
