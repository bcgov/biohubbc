import { AxiosInstance } from 'axios';
import { IFindSamplePeriodResponse, IGetSamplePeriodDetails } from 'interfaces/usePeriodApi.interface';
import { ICreateSamplingPeriodRequest, IUpdateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with survey periods
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const usePeriodApi = (axios: AxiosInstance) => {
  /**
   * Find sample periods.
   *
   * @param {{
   *       survey_id?: number;
   *       sample_site_id: number;
   *       sample_method_id: number;
   *       system_user_id?: number;
   *     }} [filterFieldData]
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IFindSamplePeriodResponse>}
   */
  const findSamplePeriods = async (
    filterFieldData?: {
      survey_id?: number;
      sample_site_id?: number;
      sample_method_id?: number;
      system_user_id?: number;
    },
    pagination?: ApiPaginationRequestOptions
  ): Promise<IFindSamplePeriodResponse> => {
    const params = {
      ...filterFieldData,
      ...pagination
    };

    const { data } = await axios.get(`/api/sampling-locations/periods`, {
      params
    });

    return data;
  };

  /**
   * Get Sample Period by ID
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} samplePeriodId
   * @return {*}  {Promise<IGetSamplePeriodDetails>}
   */
  const getSamplePeriodById = async (
    projectId: number,
    surveyId: number,
    samplePeriodId: number
  ): Promise<IGetSamplePeriodDetails> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/sample-site/sample-period/${samplePeriodId}`
    );
    return data;
  };

  /**
   * Delete Sample Periods
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} surveySamplePeriodIds
   * @return {*}  {Promise<void>}
   */
  const deleteSamplePeriods = async (
    projectId: number,
    surveyId: number,
    surveySamplePeriodIds: number[]
  ): Promise<void> => {
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/sample-site/sample-period/delete`, {
      surveySamplePeriodIds
    });
  };

  /**
   * Create Sample Periods
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateSamplingPeriodRequest} data
   * @return {*}  {Promise<void>}
   */
  const createSamplePeriods = async (
    projectId: number,
    surveyId: number,
    data: ICreateSamplingPeriodRequest
  ): Promise<void> => {
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/sample-site/sample-period`, data);
  };

  /**
   * Update sample period
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {IUpdateSamplingPeriodRequest} data
   * @return {*}  {Promise<void>}
   */
  const updateSamplePeriod = async (
    projectId: number,
    surveyId: number,
    data: IUpdateSamplingPeriodRequest
  ): Promise<void> => {
    const periodId = data.sample_period.survey_sample_period_id;

    await axios.put(`/api/project/${projectId}/survey/${surveyId}/sample-site/sample-period/${periodId}`, data);
  };

  return {
    findSamplePeriods,
    getSamplePeriodById,
    deleteSamplePeriods,
    createSamplePeriods,
    updateSamplePeriod
  };
};
