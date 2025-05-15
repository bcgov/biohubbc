import { AxiosInstance } from 'axios';
import { IAddSurveyParticipant, IGetSurveyParticipant } from 'interfaces/useSurveyApi.interface';

/**
 * Returns a set of supported api methods for working with survey participants (members).
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSurveyParticipationApi = (axios: AxiosInstance) => {
  /**
   * Get all survey participants.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<IGetSurveyParticipants[]>}
   */
  const getSurveyParticipants = async (surveyId: number): Promise<IGetSurveyParticipant[]> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/participants`);

    return data;
  };

  /**
   * Add new survey participants.
   *
   * @param {number} surveyId
   * @param {IAddSurveyParticipant[]} participants
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const addSurveyParticipants = async (surveyId: number, participants: IAddSurveyParticipant[]): Promise<boolean> => {
    const { status } = await axios.post(`/api/survey/${surveyId}/participants`, { participants });

    return status === 200;
  };

  /**
   * Remove existing survey participant.
   *
   * @param {number} surveyId
   * @param {number} surveyParticipationId
   * @return {*}  {Promise<boolean>} `true` if the request was successful, false otherwise.
   */
  const removeSurveyParticipant = async (surveyId: number, surveyParticipationId: number): Promise<boolean> => {
    const { status } = await axios.delete(`/api/survey/${surveyId}/participants/${surveyParticipationId}`);

    return status === 200;
  };

  /**
   * Update survey participant role.
   *
   * @param {number} surveyId
   * @param {number} surveyParticipationId
   * @param {string} role
   * @return {*}  {Promise<boolean>}
   */
  const updateSurveyParticipantRole = async (
    surveyId: number,
    surveyParticipationId: number,
    roleId: number
  ): Promise<boolean> => {
    const { status } = await axios.put(`/api/survey/${surveyId}/participants/${surveyParticipationId}`, {
      roleId
    });

    return status === 200;
  };

  /**
   * Add or update user roles for a survey.
   *
   * @param {number} surveyId
   * @param {{ user_id: number; role_id: number }[]} userRoles
   * @return {*}  {Promise<any>}
   */
  const postUserSurveyRoles = async (
    surveyId: number,
    userRoles: { user_id: number; role_id: number }[]
  ): Promise<any> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/users`, { userRoles });
    return data;
  };

  return {
    getSurveyParticipants,
    addSurveyParticipants,
    removeSurveyParticipant,
    updateSurveyParticipantRole,
    postUserSurveyRoles
  };
};

export default useSurveyParticipationApi;
