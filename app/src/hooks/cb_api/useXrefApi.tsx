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
   * @param {string} name
   * @param {string[]} tsns
   * @return {*}  {Promise<CBMeasurementSearchByTermResponse>}
   */
  const getMeasurementTypeDefinitionsBySearchTerm = async (
    name: string,
    tsns?: number[]
  ): Promise<CBMeasurementSearchByTermResponse> => {
    const t = tsns?.map((tsn) => Number(tsn))
    const { data } = await axios.get(`/api/critterbase/xref/taxon-measurements/search`, {
      params: { name, tsns: t },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });
    return data;
  };

  /**
   * Get collection (ie. ecological) units that are available for a given taxon (by itis tsn).
   *
   * @param {number} tsn
   * @return {*}  {Promise<ICollectionCategory[]>}
   */
  const getTsnCollectionCategories = async (tsn: number): Promise<ICollectionCategory[]> => {
    const { data } = await axios.get(`/api/critterbase/xref/taxon-collection-categories?tsn=${tsn}`);
    return data;
  };

  /**
   * Get collection (ie. ecological) units that are available for a given taxon
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
