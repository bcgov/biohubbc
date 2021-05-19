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
  species: string;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;

  constructor(surveyDetailsData?: any) {
    defaultLog.debug({ label: 'GetSurveyDetailsData', message: 'params', surveyDetailsData: surveyDetailsData });

    console.log('.... inside GetSurveyDetailsData');

    this.id = surveyDetailsData?.id ?? null;
    this.survey_name = surveyDetailsData?.name || '';
    this.survey_purpose = surveyDetailsData?.objectives || '';
    this.species = surveyDetailsData?.species || '';
    this.start_date = surveyDetailsData?.start_date || '';
    this.end_date = surveyDetailsData?.end_date || '';
    this.biologist_first_name = surveyDetailsData?.lead_first_name || '';
    this.biologist_last_name = surveyDetailsData?.lead_last_name || '';
    this.survey_area_name = surveyDetailsData?.location_name || '';
    this.geometry = (surveyDetailsData?.geometry?.length && [JSON.parse(surveyDetailsData.geometry)]) || [];
    this.revision_count = surveyDetailsData?.revision_count ?? null;
  }
}

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey proprietor data
 *
 * @export
 * @class GetSurveyDetailsData
 */
 export class GetSurveyProprietorData {
  id: number;
  proprietor_type_name: string;
  first_nations_name: string;
  proprietor_type_id: number;
  first_nations_id: number;
  category_rationale: string;
  proprietor_name: string;
  data_sharing_agreement_required: string;
  revision_count: number;

  constructor(surveyProprietorData?: any) {
    defaultLog.debug({ label: 'GetSurveyProprietorData', message: 'params', surveyProprietorData: surveyProprietorData });

    console.log('.... inside GetSurveyProprietorData');

    this.id = surveyProprietorData?.id ?? null;
    this.proprietor_type_name = surveyProprietorData?.proprietor_type_name || '';
    this.first_nations_name = surveyProprietorData?.first_nations_name || '';
    this.proprietor_type_id = surveyProprietorData?.proprietor_type_id ?? null;
    this.first_nations_id = surveyProprietorData?.first_nations_id ?? null;
    this.category_rationale = surveyProprietorData?.category_rationale || '';
    this.proprietor_name = surveyProprietorData?.proprietor_name || '';
    this.data_sharing_agreement_required = surveyProprietorData?.data_sharing_agreement_required || '';
    this.revision_count = surveyProprietorData?.revision_count ?? null;
  }
}
