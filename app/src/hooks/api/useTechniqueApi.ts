import { AxiosInstance } from 'axios';
import { ICreateTechniqueRequest, IGetTechnique, ITechniqueResponse } from 'interfaces/useTechniqueApi.interface';

/**
 * Returns a set of supported api methods for working with techniques.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useTechniqueApi = (axios: AxiosInstance) => {
  /**
   * Get techniques.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<ICreateTechniqueResponse>}
   */
  const getTechniquesForSurvey = async (projectId: number, surveyId: number): Promise<ITechniqueResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/technique`);

    return data;
  };

  /**
   * Get Technique by ID
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} techniqueId
   * @return {*}  {Promise<void>}
   */
  const getTechniqueById = async (projectId: number, surveyId: number, techniqueId: number): Promise<IGetTechnique> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/technique/${techniqueId}}`);
    return data;
  };

  /**
   * Create a new project technique
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateTechniqueRequest[]} techniques
   * @return {*}  {Promise<IGetTechnique[]>}
   */
  const createTechniques = async (
    projectId: number,
    surveyId: number,
    techniques: ICreateTechniqueRequest[]
  ): Promise<IGetTechnique[]> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/technique`, {
      techniques
    });

    return data;
  };

  /**
   * Delete a techniques
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

  return { createTechniques, getTechniqueById, getTechniquesForSurvey, deleteTechnique };
};

export default useTechniqueApi;
