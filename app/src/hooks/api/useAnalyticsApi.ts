import { AxiosInstance } from 'axios';
import { IObservationCountByGroup } from 'interfaces/useAnalyticsApi';

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
    let url = `/api/analytics/observations?surveyIds=${surveyIds.join(',')}&groupByColumns=${groupByColumns.join(',')}`;

    if (groupByQualitativeMeasurements.length) {
      url =
        url +
        `&groupByQualitativeMeasurements=${groupByQualitativeMeasurements.join(',')}
    `;
    }

    if (groupByQuantitativeMeasurements.length) {
      url = url + `&groupByQuantitativeMeasurements=${groupByQuantitativeMeasurements.join(',')}`;
    }

    const { data } = await axios.get(url);
    return data;
  };

  return { getObservationCountByGroup };
};

export default useAnalyticsApi;
