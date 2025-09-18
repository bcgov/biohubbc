import { AxiosInstance } from 'axios';
import { ITrimmedPayload } from 'features/surveys/invite/InviteSurveyMembersPage';
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
   * Add users to multiple surveys
   *
   * @param {IManageUsersFormValues} values
   * @return {*}  {Promise<void>}
   */
  const addBulkSurveysMembers = async (values: ITrimmedPayload): Promise<any> => {
    const { data } = await axios.post(`/api/survey/members`, values);
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
    addBulkSurveysMembers,
    getUserSurveyMember
  };
};

export default useSurveyMemberApi;
