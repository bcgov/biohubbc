import { AxiosInstance } from 'axios';
import {
  CreateSurveyHabitatFeature,
  getSurveyHabitatFeaturesWithSupplementaryData,
  UpdateSurveyHabitatFeature
} from 'interfaces/useSurveyHabitatFeature.interface';

/**
 * Returns a set of supported api methods for working with survey habitat feature records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSurveyHabitatFeature = (axios: AxiosInstance) => {
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
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/habitat-features`, {
      surveyHabitatFeatures: habitatFeatures
    });

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
  ): Promise<void> => {
    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/habitat-features/${surveyHabitatFeatureId}`,
      {
        surveyhabitatfeature: habitatFeature
      }
    );

    return data;
  };

  /**
   * Get survey habitat feature records, with supplementary data.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<getSurveyHabitatFeaturesWithSupplementaryData>}
   */
  const getSurveyHabitatFeaturesWithSupplementaryData = async (
    projectId: number,
    surveyId: number
  ): Promise<getSurveyHabitatFeaturesWithSupplementaryData> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/habitat-features`);

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
    deleteSurveyHabitatFeature,
    deleteSurveyHabitatFeatures
  };
};

export default useSurveyHabitatFeature;
