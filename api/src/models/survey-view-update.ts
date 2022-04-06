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
  survey_data_proprietary: string;
  data_sharing_agreement_required: string;
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
    this.survey_data_proprietary = data?.survey_data_proprietary || 'true';
    this.data_sharing_agreement_required = data?.disa_required ? 'true' : 'false';
    this.revision_count = data?.revision_count ?? null;
  }
}

export class GetSurveyPurposeAndMethodologyData {
  id: number;
  intended_outcome_id: number;
  field_method_id: number;
  additional_details: string;
  ecological_season_id: number;
  vantage_id: number;
  revision_count: number;

  constructor(data?: any) {
    defaultLog.debug({
      label: 'GetSurveyPurposeAndMethodologyData',
      message: 'params',
      surveyProprietorData: data
    });

    this.id = data?.id ?? null;
    this.intended_outcome_id = data?.intended_outcome_id ?? null;
    this.field_method_id = data?.field_method_id ?? null;
    this.additional_details = data?.additional_details ?? null;
    this.ecological_season_id = data?.ecological_season_id ?? null;
    this.vantage_id = data?.vantage_id ?? null;
    this.revision_count = data?.revision_count ?? null;
  }
}
