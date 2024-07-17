import { AxiosInstance } from 'axios';
import {
  ICreateTechniqueRequest,
  IGetTechniqueResponse,
  IGetTechniquesResponse,
  IUpdateTechniqueRequest
} from 'interfaces/useTechniqueApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with techniques.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useTechniqueApi = (axios: AxiosInstance) => {
  /**
   * Get all techniques for a survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IGetTechniquesResponse>}
   */
  const getTechniquesForSurvey = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetTechniquesResponse> => {
    const params = {
      ...pagination
    };

    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/technique`, {
      params,
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Get a technique.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<void>}
   */
  const getTechniqueById = async (
    projectId: number,
    surveyId: number,
    methodTechniqueId: number
  ): Promise<IGetTechniqueResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/technique/${methodTechniqueId}`);

    return data;
  };

  /**
   * Create a new technique.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateTechniqueRequest[]} techniques
   * @return {*}  {Promise<IGetTechniqueResponse[]>}
   */
  const createTechniques = async (
    projectId: number,
    surveyId: number,
    techniques: ICreateTechniqueRequest[]
  ): Promise<IGetTechniqueResponse[]> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/technique`, {
      techniques
    });

    return data;
  };

  /**
   * Update an existing technique.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {IUpdateTechniqueRequest} technique
   * @return {*}  {Promise<IGetTechniqueResponse>}
   */
  const updateTechnique = async (
    projectId: number,
    surveyId: number,
    methodTechniqueId: number,
    technique: IUpdateTechniqueRequest
  ): Promise<IGetTechniqueResponse> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/technique/${methodTechniqueId}`, {
      technique
    });

    return data;
  };

  /**
   * Delete a technique.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}
   */
  const deleteTechnique = async (projectId: number, surveyId: number, methodTechniqueId: number): Promise<void> => {
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/technique/${methodTechniqueId}`);

    return data;
  };

  /**
   * Delete techniques.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number[]} methodTechniqueIds[]
   * @return {*}  {Promise<void>}
   */
  const deleteTechniques = async (projectId: number, surveyId: number, methodTechniqueIds: number[]): Promise<void> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/technique/delete`, {
      methodTechniqueIds
    });

    return data;
  };

  return {
    createTechniques,
    updateTechnique,
    getTechniqueById,
    getTechniquesForSurvey,
    deleteTechnique,
    deleteTechniques
  };
};

export default useTechniqueApi;
