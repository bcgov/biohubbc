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
