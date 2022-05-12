import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-view-update');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey proprietor data
 *
 * @export
 * @class GetSurveyProprietorData
 */
export class GetSurveyProprietorData {
  id: number;
  proprietary_data_category_name: string;
  first_nations_name: string;
  proprietary_data_category: number;
  first_nations_id: number;
  category_rationale: string;
  proprietor_name: string;
  data_sharing_agreement_required: string;
  survey_data_proprietary: string;
  revision_count: number;

  constructor(data?: any) {
    defaultLog.debug({
      label: 'GetSurveyProprietorData',
      message: 'params',
      surveyProprietorData: data
    });

    this.id = data?.id ?? null;
    this.proprietary_data_category_name = data?.proprietor_type_name || '';
    this.first_nations_name = data?.first_nations_name || '';
    this.proprietary_data_category = data?.proprietor_type_id ?? null;
    this.first_nations_id = data?.first_nations_id ?? null;
    this.category_rationale = data?.category_rationale || '';
    this.proprietor_name = data?.proprietor_name || '';
    this.data_sharing_agreement_required = data?.disa_required ? 'true' : 'false';
    this.survey_data_proprietary = (data?.id && 'true') || 'false'; // The existence of a survey proprietor record indicates the survey data is proprietary
    this.revision_count = data?.revision_count ?? null;
  }
}

export class GetSurveyPurposeAndMethodologyData {
  id: number;
  intended_outcome_id: number;
  additional_details: string;
  field_method_id: number;
  ecological_season_id: number;
  revision_count: number;
  vantage_code_ids: number[];
  surveyed_all_areas: string;

  constructor(responseData?: any) {
    defaultLog.debug({
      label: 'GetSurveyPurposeAndMethodologyData',
      message: 'params',
      data: responseData
    });

    this.id = responseData.id ?? null;
    this.intended_outcome_id = responseData.intended_outcome_id ?? null;
    this.additional_details = responseData.additional_details;
    this.field_method_id = responseData.field_method_id ?? null;
    this.ecological_season_id = responseData.ecological_season_id ?? null;
    this.revision_count = responseData.revision_count ?? 0;
    this.vantage_code_ids = (responseData?.vantage_ids?.length && responseData.vantage_code_ids) || [];
    this.surveyed_all_areas = (responseData.surveyed_all_areas && 'true') || 'false';
  }
}
