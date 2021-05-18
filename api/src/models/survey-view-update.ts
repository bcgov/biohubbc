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
  focal_species: (string | number)[];
  ancillary_species: (string | number)[];
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

    const focalSpeciesList =
      surveyData.map((item: any) => {
        return item.focal_species;
      }) || [];

    const ancillarySpeciesList =
      surveyData.map((item: any) => {
        return item.ancillary_species;
      }) || [];

    this.survey_name = surveyDataItem?.name || '';
    this.survey_purpose = surveyDataItem?.objectives || '';
    this.focal_species = (focalSpeciesList.length && focalSpeciesList.filter((item: string | number) => !!item)) || [];
    this.ancillary_species =
      (ancillarySpeciesList.length && ancillarySpeciesList.filter((item: string | number) => !!item)) || [];
    this.start_date = surveyDataItem?.start_date || '';
    this.end_date = surveyDataItem?.end_date || '';
    this.biologist_first_name = surveyDataItem?.lead_first_name || '';
    this.biologist_last_name = surveyDataItem?.lead_last_name || '';
    this.survey_area_name = surveyDataItem?.location_name || '';
    this.geometry = (surveyDataItem?.geometry?.length && [JSON.parse(surveyDataItem.geometry)]) || [];
    this.revision_count = surveyDataItem?.revision_count ?? null;
  }
}
