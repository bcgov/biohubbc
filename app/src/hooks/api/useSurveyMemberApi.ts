import { AxiosInstance } from 'axios';
import { IGetUserSurveyMemberResponse } from 'interfaces/useSurveyMemberApi.interface';

/**
 * Returns a set of supported api methods for working with survey members.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSurveyMemberApi = (axios: AxiosInstance) => {
  /**
   * Get all survey mems.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<IGetUserSurveyMemberResponse[]>}
   */
  const getSurveyMembers = async (surveyId: number): Promise<IGetUserSurveyMemberResponse[]> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/members`);

    return data;
  };

  /**
   * Get all survey mems.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<IGetUserSurveyMemberResponse>}
   */
  const getUserSurveyMember = async (surveyId: number): Promise<IGetUserSurveyMemberResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/members/self`);

    return data;
  };

  return {
    getSurveyMembers,
    getUserSurveyMember
  };
};

export default useSurveyMemberApi;
