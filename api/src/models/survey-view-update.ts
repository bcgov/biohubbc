import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-view-update');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey details data
 *
 * @export
 * @class GetSurveyDetailsData
 */
export class GetSurveyDetailsData {
  id: number;
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

  constructor(surveyDetailsData?: any) {
    defaultLog.debug({ label: 'GetSurveyDetailsData', message: 'params', surveyDetailsData });

    const surveyDataItem = surveyDetailsData && surveyDetailsData.length && surveyDetailsData[0];

    const focalSpeciesList =
      (surveyDetailsData &&
        surveyDetailsData.map((item: any) => {
          return item.focal_species;
        })) ||
      [];

    const ancillarySpeciesList =
      (surveyDetailsData &&
        surveyDetailsData.map((item: any) => {
          return item.ancillary_species;
        })) ||
      [];

    this.id = surveyDataItem?.id ?? null;
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

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey proprietor data
 *
 * @export
 * @class GetSurveyProprietorData
 */
export class GetSurveyProprietorData {
  isProprietary: string;
  id: number;
  proprietary_data_category_name: string;
  first_nations_name: string;
  proprietary_data_category: number;
  first_nations_id: number;
  category_rationale: string;
  proprietor_name: string;
  data_sharing_agreement_required: string;
  revision_count: number;

  constructor(data?: any) {
    defaultLog.debug({
      label: 'GetSurveyProprietorData',
      message: 'params',
      surveyProprietorData: data
    });

    this.isProprietary = (data && 'true') || 'false';
    this.id = data?.id ?? null;
    this.proprietary_data_category_name = data?.proprietor_type_name || '';
    this.first_nations_name = data?.first_nations_name || '';
    this.proprietary_data_category = data?.proprietor_type_id ?? null;
    this.first_nations_id = data?.first_nations_id ?? null;
    this.category_rationale = data?.category_rationale || '';
    this.proprietor_name = data?.proprietor_name || '';
    this.data_sharing_agreement_required = data?.disa_required ? 'true' : 'false';
    this.revision_count = data?.revision_count ?? null;
  }
}
