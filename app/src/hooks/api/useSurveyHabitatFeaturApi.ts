import { AxiosInstance } from 'axios';
import {
  CreateSurveyHabitatFeature,
  FindSurveyHabitatFeatures,
  getSurveyHabitatFeaturesWithSupplementaryData,
  SurveyHabitatFeaturesAdvancedFilters,
  SurveyHabitatFeaturesGeometry,
  UpdateSurveyHabitatFeature
} from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with survey habitat feature records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSurveyHabitatFeatureApi = (axios: AxiosInstance) => {
  /**
   * Create new survey habitat feature records.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {CreateSurveyHabitatFeature[]} habitatFeatures
   * @return {*}  {Promise<void>}
   */
  const createSurveyHabitatFeatures = async (
    projectId: number,
    surveyId: number,
    habitatFeatures: CreateSurveyHabitatFeature[]
  ): Promise<void> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/habitat-features`, habitatFeatures);

    return data;
  };

  /**
   * Update an existing survey habitat feature record.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @param {UpdateSurveyHabitatFeature} habitatFeature
   * @return {*}  {Promise<getSurveyHabitatFeaturesWithSupplementaryData>}
   */
  const updateSurveyHabitatFeature = async (
    projectId: number,
    surveyId: number,
    surveyHabitatFeatureId: number,
    habitatFeature: UpdateSurveyHabitatFeature
  ): Promise<getSurveyHabitatFeaturesWithSupplementaryData> => {
    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/habitat-features/${surveyHabitatFeatureId}`,
      habitatFeature
    );

    return data;
  };

  /**
   * Get survey habitat feature records, with supplementary data.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<void>}
   */
  const getSurveyHabitatFeaturesWithSupplementaryData = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<void> => {
    const params = {
      ...pagination
    };

    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/habitat-features`, { params });

    return data;
  };

  /**
   * Get habitat feature spatial data, for a survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyHabitatFeaturesGeometry>}
   */
  const getSurveyHabitatFeaturesGeometry = async (
    projectId: number,
    surveyId: number
  ): Promise<SurveyHabitatFeaturesGeometry> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/habitat-features/spatial`);

    return data;
  };

  /**
   * Find survey habitat feature records.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {SurveyHabitatFeaturesAdvancedFilters} [filterFieldData]
   * @return {*}  {Promise<FindSurveyHabitatFeatures>}
   */
  const findSurveyHabitatFeatures = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: SurveyHabitatFeaturesAdvancedFilters
  ): Promise<FindSurveyHabitatFeatures> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get(`/api/habitat-features`, { params });

    return data;
  };

  /**
   * Delete an existing survey habitat feature record.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} surveyHabitatFeatureId
   * @return {*}  {Promise<void>}
   */
  const deleteSurveyHabitatFeature = async (
    projectId: number,
    surveyId: number,
    surveyHabitatFeatureId: number
  ): Promise<void> => {
    const { data } = await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/habitat-features/${surveyHabitatFeatureId}`
    );

    return data;
  };

  /**
   * Delete existing survey habitat feature records.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number[]} surveyHabitatFeatureIds
   * @return {*}  {Promise<void>}
   */
  const deleteSurveyHabitatFeatures = async (
    projectId: number,
    surveyId: number,
    surveyHabitatFeatureIds: number[]
  ): Promise<void> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/habitat-features/delete`, {
      surveyHabitatFeatureIds
    });

    return data;
  };

  return {
    createSurveyHabitatFeatures,
    updateSurveyHabitatFeature,
    getSurveyHabitatFeaturesWithSupplementaryData,
    getSurveyHabitatFeaturesGeometry,
    findSurveyHabitatFeatures,
    deleteSurveyHabitatFeature,
    deleteSurveyHabitatFeatures
  };
};

export default useSurveyHabitatFeatureApi;
