import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-view-update');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey data
 *
 * @export
 * @class GetSurveyData
 */
export class GetSurveyData {
  survey_name: string;
  survey_purpose: string;
  species: string;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  revision_count: number;

  constructor(surveyData?: any) {
    defaultLog.debug({ label: 'GetSurveyData', message: 'params', surveyData });

    this.survey_name = surveyData?.name || '';
    this.survey_purpose = surveyData?.objectives || '';
    this.species = surveyData?.species || '';
    this.start_date = surveyData?.start_date || '';
    this.end_date = surveyData?.end_date || '';
    this.biologist_first_name = surveyData?.lead_first_name || '';
    this.biologist_last_name = surveyData?.lead_last_name || '';
    this.survey_area_name = surveyData?.location_name || '';
    this.revision_count = surveyData?.revision_count ?? null;
  }
}
