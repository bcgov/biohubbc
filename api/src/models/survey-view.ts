import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-view');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey proprietor data
 *
 * @export
 * @class GetSurveyProprietorData
 */
export class GetSurveyProprietorData {
  proprietor_type_name: string;
  first_nations_name: string;
  category_rational: string;
  proprietor_name: string;
  data_sharing_agreement_required: string;

  constructor(surveyProprietorData?: any) {
    defaultLog.debug({ label: 'GetSurveyProprietorData', message: 'params', surveyProprietorData });

    this.proprietor_type_name = surveyProprietorData?.proprietor_type_name || '';
    this.first_nations_name = surveyProprietorData?.first_nations_name || '';
    this.category_rational = surveyProprietorData?.rationale || '';
    this.proprietor_name = surveyProprietorData?.proprietor_name || '';
    this.data_sharing_agreement_required = (surveyProprietorData?.data_sharing_agreement_required && 'true') || 'false';
  }
}

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
  }
}
