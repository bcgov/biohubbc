import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-create');

/**
 * Processes all POST /project/{projectId}/survey/create request data.
 *
 * @export
 * @class PostSurveyObject
 */
export class PostSurveyObject {
  survey_name: string;
  biologist_first_name: string;
  biologist_last_name: string;
  foippa_requirements_accepted: boolean;
  focal_species: number[];
  ancillary_species: number[];
  start_date: string;
  end_date: string;
  survey_area_name: string;
  survey_data_proprietary: boolean;
  survey_purpose: string;
  geometry: Feature[];
  permit_number: string;
  permit_type: string;
  funding_sources: number[];
  survey_proprietor?: PostSurveyProprietorData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSurveyData', message: 'params', obj });

    this.biologist_first_name = obj?.biologist_first_name || null;
    this.biologist_last_name = obj?.biologist_last_name || null;
    this.end_date = obj?.end_date || null;
    this.foippa_requirements_accepted = obj?.foippa_requirements_accepted === 'true' || false;
    this.focal_species = (obj?.focal_species?.length && obj.focal_species) || [];
    this.ancillary_species = (obj?.ancillary_species?.length && obj.ancillary_species) || [];
    this.start_date = obj?.start_date || null;
    this.survey_area_name = obj?.survey_area_name || null;
    this.permit_number = obj?.permit_number || null;
    this.permit_type = obj?.permit_type || null;
    this.funding_sources = (obj?.funding_sources?.length && obj.funding_sources) || [];
    this.survey_data_proprietary = obj?.survey_data_proprietary === 'true' || false;
    this.survey_name = obj?.survey_name || null;
    this.survey_purpose = obj?.survey_purpose || null;
    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
    this.survey_proprietor =
      (obj && obj.survey_data_proprietary === 'true' && new PostSurveyProprietorData(obj)) || undefined;
  }
}

/**
 * Processes POST /project/{projectId}/survey/create survey proprietor data
 *
 * @export
 * @class PostSurveyProprietorData
 */
export class PostSurveyProprietorData {
  prt_id: number;
  fn_id: number;
  rationale: string;
  proprietor_name: string;
  disa_required: boolean;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSurveyProprietorData', message: 'params', obj });

    this.prt_id = obj?.proprietary_data_category || null;
    this.fn_id = obj?.first_nations_id || null;
    this.rationale = obj?.category_rationale || null;
    this.proprietor_name = (!obj?.first_nations_id && obj?.proprietor_name) || null;
    this.disa_required = obj?.data_sharing_agreement_required === 'true' || false;
  }
}
