import { AxiosInstance } from 'axios';
import { IObservationCountByGroup } from 'interfaces/useAnalyticsApi.interface';

/**
 * Returns a set of supported api methods for working with survey analytics
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useAnalyticsApi = (axios: AxiosInstance) => {
  /**
   * Create a new project survey
   *
   * @param {number[]} surveyIds
   * @param {string[]} groupByColumns
   * @param {string[]} groupByQualitativeMeasurements
   * @param {string[]} groupByQuantitativeMeasurements
   * @return {*}
   */
  const getObservationCountByGroup = async (
    surveyIds: number[],
    groupByColumns: string[],
    groupByQuantitativeMeasurements: string[],
    groupByQualitativeMeasurements: string[]
  ): Promise<IObservationCountByGroup[]> => {
    const { data } = await axios.get('/api/analytics/observations', {
      params: { surveyIds, groupByColumns, groupByQuantitativeMeasurements, groupByQualitativeMeasurements }
    });

    return data;
  };

  return { getObservationCountByGroup };
};

export default useAnalyticsApi;
