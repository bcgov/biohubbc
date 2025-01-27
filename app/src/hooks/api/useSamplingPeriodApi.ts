import { AxiosInstance } from 'axios';
import {
  CreateSamplingPeriod,
  FindSamplingPeriods,
  GetSamplingPeriod,
  GetSamplingPeriodsPaginated,
  UpdateSamplingPeriod
} from 'interfaces/useSamplingPeriodApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with search functionality
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useSamplingPeriodApi = (axios: AxiosInstance) => {
  /**
   * Create Sampling Periods
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateSamplingSiteRequest} samplePeriods
   * @return {*}  {Promise<void>}
   */
  const createSamplingPeriods = async (
    projectId: number,
    surveyId: number,
    samplePeriods: CreateSamplingPeriod[]
  ): Promise<void> => {
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/sample-period`, { sample_periods: samplePeriods });
  };

  /**
   * Get Sample periods for a survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} pagination
   * @return {*}  {Promise<GetSamplingPeriodsPaginated>}
   */
  const getSamplePeriodsForSurvey = async (
    projectId: number,
    surveyId: number,
    options?: {
      pagination?: ApiPaginationRequestOptions;
    }
  ): Promise<GetSamplingPeriodsPaginated> => {
    const params = {
      ...options?.pagination
    };

    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/sample-period`, {
      params
    });

    return data;
  };

  /**
   * Get Sample period by ID.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} samplePeriodId
   * @return {*}  {Promise<GetSamplingPeriod>}
   */
  const getSamplePeriodById = async (
    projectId: number,
    surveyId: number,
    samplePeriodId: number
  ): Promise<GetSamplingPeriod> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/sample-period/${samplePeriodId}`);

    return data;
  };

  /**
   * Find sample periods.
   *
   * @param {{
   *       survey_id?: number;
   *       sample_site_id?: number[];
   *       method_technique_id?: number[];
   *       system_user_id?: number;
   *     }} [filterFieldData]
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IFindSamplePeriodResponse>}
   */
  const findSamplePeriods = async (
    filterFieldData?: {
      survey_id?: number;
      sample_site_id?: number[];
      method_technique_id?: number[];
      system_user_id?: number;
    },
    pagination?: ApiPaginationRequestOptions
  ): Promise<FindSamplingPeriods> => {
    const params = {
      ...filterFieldData,
      ...pagination
    };

    const { data } = await axios.get(`/api/periods`, {
      params
    });

    return data;
  };

  /**
   * Update a Sampling Period.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} surveySamplePeriodId
   *    * @param {UpdateSamplingPeriod} data
   * @return {*}  {Promise<void>}
   */
  const updateSamplingPeriod = async (
    projectId: number,
    surveyId: number,
    surveySamplePeriodId: number,
    data: UpdateSamplingPeriod
  ): Promise<void> => {
    await axios.put(`/api/project/${projectId}/survey/${surveyId}/sample-period/${surveySamplePeriodId}`, data);
  };

  /**
   * Delete Sample Period
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} sampleSiteId
   * @return {*}  {Promise<void>}
   */
  const deleteSamplePeriod = async (
    projectId: number,
    surveyId: number,
    surveySamplePeriodId: number
  ): Promise<void> => {
    await axios.delete(`/api/project/${projectId}/survey/${surveyId}/sample-period/${surveySamplePeriodId}`);
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
    await axios.post(`/api/project/${projectId}/survey/${surveyId}/sample-period/delete`, {
      surveySamplePeriodIds
    });
  };

  return {
    createSamplingPeriods,
    getSamplePeriodsForSurvey,
    getSamplePeriodById,
    findSamplePeriods,
    updateSamplingPeriod,
    deleteSamplePeriod,
    deleteSamplePeriods
  };
};
