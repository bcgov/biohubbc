import { AxiosInstance } from 'axios';
import { IGetSurveyChecklistResponse } from 'interfaces/useChecklistApi.interface';

/**
 * Returns a set of supported api methods for working with survey checklists.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useChecklistApi = (axios: AxiosInstance) => {
  /**
   * Get survey checklist
   *
   * @param {number} surveyId
   * @return {*} {Promise<IGetSurveyChecklistResponse>}
   */
  const getSurveyChecklist = async (surveyId: number): Promise<IGetSurveyChecklistResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/checklist`);

    return data;
  };

  /**
   * Mark a survey checklist item as ignored/non-applicable to the survey
   *
   * @param {number} surveyId
   * @param {number} checklistItemName
   * @return {*} {Promise<void>}
   */
  const ignoreSurveyChecklistItem = async (surveyId: number, checklistItemName: string): Promise<void> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/checklist`, { checklistItemName });

    return data;
  };

  /**
   * Mark a survey checklist item as applicable
   *
   * @param {number} surveyId
   * @param {number} checklistItemName
   * @return {*} {Promise<void>}
   */
  const unignoreSurveyChecklistItem = async (surveyId: number, checklistItemName: string): Promise<void> => {
    const { data } = await axios.delete(`/api/survey/${surveyId}/checklist/${checklistItemName}`);

    return data;
  };

  return { getSurveyChecklist, ignoreSurveyChecklistItem, unignoreSurveyChecklistItem };
};
