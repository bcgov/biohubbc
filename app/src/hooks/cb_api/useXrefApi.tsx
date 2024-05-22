import { AxiosInstance } from 'axios';
import {
  CBMeasurementSearchByTermResponse,
  CBMeasurementSearchByTsnResponse,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
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
   * Gets quantitative measurement definitions by taxon_measurement_id
   *
   * @async
   * @param {CreateQualitativeMeasurement} taxon_measurement_id - Get measurement by taxon_measurement_id.
   * @returns {Promise<IQualitativeMeasurementResponse>} The created qualitative measurement.
   */
  const getQuantitativeMeasurementsById = async (
    taxon_measurement_ids: string[]
  ): Promise<CBQuantitativeMeasurementTypeDefinition[]> => {
    const { data } = await axios.post(`/api/critterbase/xref/taxon-quantitative-measurements `, {
      taxon_measurement_ids
    });
    return data;
  };

  /**
   * Gets qualitative measurement definitions by taxon_measurement_id
   *
   * @async
   * @param {CreateQualitativeMeasurement} taxon_measurement_id - Get measurement by taxon_measurement_id.
   * @returns {Promise<IQualitativeMeasurementResponse>} The created qualitative measurement.
   */
  const getQualitativeMeasurementsById = async (
    taxon_measurement_ids: string[]
  ): Promise<CBQualitativeMeasurementTypeDefinition[]> => {
    const { data } = await axios.post(`/api/critterbase/xref/taxon-qualitative-measurements `, {
      taxon_measurement_ids
    });
    return data;
  };

  return {
    getTaxonMeasurements,
    getMeasurementTypeDefinitionsBySearchTerm,
    getQualitativeMeasurementsById,
    getQuantitativeMeasurementsById
  };
};
