import { Feature } from 'geojson';
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
  species: number[];
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;

  constructor(surveyData?: any) {
    defaultLog.debug({ label: 'GetSurveyData', message: 'params', surveyData });

    const surveyDataItem = surveyData && surveyData.length && surveyData[0];
    const speciesList =
      surveyData.map((item: any) => {
        return item.species;
      }) || [];

    this.survey_name = surveyDataItem?.name || '';
    this.survey_purpose = surveyDataItem?.objectives || '';
    this.species = (speciesList.length && speciesList) || [];
    this.start_date = surveyDataItem?.start_date || '';
    this.end_date = surveyDataItem?.end_date || '';
    this.biologist_first_name = surveyDataItem?.lead_first_name || '';
    this.biologist_last_name = surveyDataItem?.lead_last_name || '';
    this.survey_area_name = surveyDataItem?.location_name || '';
    this.geometry = (surveyDataItem?.geometry?.length && [JSON.parse(surveyDataItem.geometry)]) || [];
    this.revision_count = surveyDataItem?.revision_count ?? null;
  }
}
