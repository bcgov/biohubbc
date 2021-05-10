import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-update');

/**
 * Pre-processes PUT /project/{projectId}/survey/{surveyId} survey data for update
 *
 * @export
 * @class PutSurveyData
 */
export class PutSurveyData {
  name: string;
  objectives: string;
  species: string;
  start_date: string;
  end_date: string;
  lead_first_name: string;
  lead_last_name: string;
  location_name: string;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutSurveyData', message: 'params', obj });

    this.name = obj?.survey_name || null;
    this.objectives = obj?.survey_purpose || null;
    this.species = obj?.species || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.lead_first_name = obj?.biologist_first_name || null;
    this.lead_last_name = obj?.biologist_last_name || null;
    this.location_name = obj?.survey_area_name || null;
    this.revision_count = obj?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey data for update
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
