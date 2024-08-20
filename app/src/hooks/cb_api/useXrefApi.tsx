import { AxiosInstance } from 'axios';
import {
  CBMeasurementSearchByTermResponse,
  CBMeasurementSearchByTsnResponse,
  ICollectionCategory,
  ICollectionUnit
} from 'interfaces/useCritterApi.interface';
import qs from 'qs';

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
   * Get collection (ie. ecological) units that are available for a given taxon (by itis tsn).
   *
   * @param {number} tsn
   * @return {*}  {Promise<ICollectionCategory[]>}
   */
  const getTsnCollectionCategories = async (tsn: number): Promise<ICollectionCategory[]> => {
    const { data } = await axios.get('/api/critterbase/xref/taxon-collection-categories', {
      params: { tsn },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Get collection (ie. ecological) units values for a given collection unit
   *
   * @param {string} unit_id
   * @return {*}  {Promise<ICollectionUnit[]>}
   */
  const getCollectionUnits = async (unit_id: string): Promise<ICollectionUnit[]> => {
    const { data } = await axios.get(`/api/critterbase/xref/collection-units/${unit_id}`);
    return data;
  };

  return {
    getTaxonMeasurements,
    getMeasurementTypeDefinitionsBySearchTerm,
    getTsnCollectionCategories,
    getCollectionUnits
  };
};
