import { AxiosInstance } from 'axios';
import { ICreateTechniqueRequest, ITechniqueResponse } from 'interfaces/useTechniqueApi.interface';

/**
 * Returns a set of supported api methods for working with techniques.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useTechniqueApi = (axios: AxiosInstance) => {
  /**
   * Get techniques for a survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<ICreateTechniqueResponse>}
   */
  const getTechniquesForSurvey = async (projectId: number, surveyId: number): Promise<ITechniqueResponse[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/technique`);

    return data;
  };

  /**
   * Create a new project technique
   *
   * @param {ICreateTechniqueRequest} technique
   * @return {*}  {Promise<ICreateTechniqueResponse>}
   */
  const createTechnique = async (
    projectId: number,
    surveyId: number,
    technique: ICreateTechniqueRequest
  ): Promise<ITechniqueResponse[]> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/technique/create`, {techniques: [technique]});

    return data;
  };

  return { createTechnique, getTechniquesForSurvey };
};

export { useTechniqueApi };
