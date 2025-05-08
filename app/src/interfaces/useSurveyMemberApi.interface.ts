import { SURVEY_ROLE } from 'constants/roles';

export type IGetUserSurveyMemberResponse = {
  survey_id: number;
  system_user_id: number;
  survey_role_ids: number[];
  survey_role_names: SURVEY_ROLE[];
} | null;

/**
 * Get surveys list response object.
 *
 * @export
 * @interface IGetUserSurveysListResponse
 */
export interface IGetUserSurveysListResponse {
  survey_member_id: number;
  survey_id: number;
  survey_name: string;
  system_user_id: number;
  survey_role_ids: number[];
  survey_role_names: string[];
}
