import { AxiosInstance } from 'axios';
import {
  IGetSurveyFiltersResponse,
  IPostSurveyFilter,
  IPutSurveyFilter,
  ISurveyFilter
} from 'interfaces/useFilterApi.interface';

/**
 * Returns a set of supported api methods for managing survey filters
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useFilterApi = (axios: AxiosInstance) => {
  /**
   * Get system survey_filter details based on its ID for viewing purposes.
   *
   * @return {*} {Promise<IGetSurveyFiltersResponse[]>}
   */
  const getSurveyFilters = async (): Promise<IGetSurveyFiltersResponse> => {
    const { data } = await axios.get(`/api/survey-filter`);

    return data;
  };

  /**
   * Get a specific survey_filter for editing
   *
   * @param {number} surveyFilterId
   * @return {*} {Promise<ISurveyFilter>}
   */
  const getSurveyFilterById = async (surveyFilterId: number): Promise<ISurveyFilter> => {
    const { data } = await axios.get(`/api/survey-filter/${surveyFilterId}`);

    return data;
  };

  /**
   * Create a new system survey_filter
   *
   * @param {IPostSurveyFilter} survey_filter
   * @return {*} {Promise<void>}
   */
  const createSurveyFilter = async (survey_filter: IPostSurveyFilter): Promise<void> => {
    const { data } = await axios.post(`/api/survey-filter`, survey_filter);

    return data;
  };

  /**
   * Create a new system survey_filter
   *
   * @param {ISurveyFilter} survey_filter
   * @return {*} {Promise<{ survey_filter_id: number }>}
   */
  const updateSurveyFilter = async (survey_filter: IPutSurveyFilter): Promise<{ survey_filter_id: number }> => {
    const { data } = await axios.put(`/api/survey-filter/${survey_filter.survey_filter_id}`, survey_filter);

    return data;
  };

  /**
   * Get system survey_filter details based on its ID for viewing purposes.
   *
   * @param {number} surveyFilterId
   * @return {*} {Promise<{ survey_filter_id: number }>}
   */
  const deleteSurveyFilter = async (surveyFilterId: number): Promise<{ survey_filter_id: number }> => {
    const { data } = await axios.delete(`/api/survey-filter/${surveyFilterId}`);

    return data;
  };

  return { getSurveyFilters, updateSurveyFilter, createSurveyFilter, deleteSurveyFilter, getSurveyFilterById };
};
