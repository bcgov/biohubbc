import { Feature } from 'geojson';
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
  geometry: Feature[];
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutSurveyData', message: 'params', obj });

    this.name = obj?.survey_details?.survey_name || null;
    this.objectives = obj?.survey_details?.survey_purpose || null;
    this.species = obj?.survey_details?.species || null;
    this.start_date = obj?.survey_details?.start_date || null;
    this.end_date = obj?.survey_details?.end_date || null;
    this.lead_first_name = obj?.survey_details?.biologist_first_name || null;
    this.lead_last_name = obj?.survey_details?.biologist_last_name || null;
    this.location_name = obj?.survey_details?.survey_area_name || null;
    this.geometry = obj?.survey_details?.geometry || null;
    this.revision_count = obj?.survey_details?.revision_count ?? null;
  }
}
