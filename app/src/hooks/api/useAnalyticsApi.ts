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
   * @param {ICreateSurveyRequest} survey
   * @return {*}  {Promise<ICreateSurveyResponse>}
   */
  const getObservationCountByGroup = async (
    surveyIds: number[],
    groupBy: string[]
  ): Promise<IObservationCountByGroup> => {
    const { data } = await axios.get(
      `/api/analytics/observations?surveyIds=${surveyIds.join(',')}&groupBy=${groupBy.join(',')}`
    );

    return data;
  };

  return { getObservationCountByGroup };
};

export default useAnalyticsApi;
