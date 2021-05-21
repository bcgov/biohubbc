import { AxiosInstance } from 'axios';
import {
  ICreateSurveyRequest,
  ICreateSurveyResponse,
  IGetSurveyForViewResponse,
  IGetSurveysListResponse,
  ISurveyUpdateRequest,
  IGetSurveyForUpdateResponse
} from 'interfaces/useSurveyApi.interface';

/**
 * Returns a set of supported api methods for working with surveys.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSurveyApi = (axios: AxiosInstance) => {
  /**
   * Create a new project survey
   *
   * @param {ICreateSurveyRequest} survey
   * @return {*}  {Promise<ICreateSurveyResponse>}
   */
  const createSurvey = async (projectId: number, survey: ICreateSurveyRequest): Promise<ICreateSurveyResponse> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/create`, survey);

    return data;
  };

  /**
   * Get project survey details based on its ID for viewing purposes.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*} {Promise<IGetSurveyForViewResponse>}
   */
  const getSurveyForView = async (projectId: number, surveyId: number): Promise<IGetSurveyForViewResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/view`);

    return data;
  };

  /**
   * Get surveys list.
   *
   * @param {number} projectId
   * @return {*}  {Promise<IGetSurveysListResponse[]>}
   */
  const getSurveysList = async (projectId: number): Promise<IGetSurveysListResponse[]> => {
    const { data } = await axios.get(`/api/project/${projectId}/surveys`);

    return data;
  };

  /**
   * Get survey data for update purposes.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IGetSurveyForUpdateResponse>}
   */
  const getSurveyForUpdate = async (projectId: number, surveyId: number): Promise<IGetSurveyForUpdateResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/update`);

    return data;
  };

  /**
   * Update an existing survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ISurveyUpdateRequest} surveyData
   * @return {*}  {Promise<any>}
   */
  const updateSurvey = async (projectId: number, surveyId: number, surveyData: ISurveyUpdateRequest): Promise<any> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/update`, surveyData);

    return data;
  };

  return {
    createSurvey,
    getSurveyForView,
    getSurveysList,
    getSurveyForUpdate,
    updateSurvey
  };
};

export default useSurveyApi;
