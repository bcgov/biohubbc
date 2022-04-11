import { COMPLETION_STATUS } from '../constants/status';
import { Feature } from 'geojson';
import moment from 'moment';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-update');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey details data for update
 *
 * @export
 * @class GetUpdateSurveyDetailsData
 */
export class GetUpdateSurveyDetailsData {
  id: number;
  survey_name: string;
  focal_species: (string | number)[];
  ancillary_species: (string | number)[];
  common_survey_methodology_id: number;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;
  permit_number: string;
  permit_type: string;
  funding_sources: number[];
  completion_status: string;
  publish_date: string;

  constructor(surveyDetailsData?: any) {
    defaultLog.debug({
      label: 'GetUpdateSurveyDetailsData',
      message: 'params',
      surveyDetailsData: {
        ...surveyDetailsData,
        geometry: surveyDetailsData?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });

    this.id = surveyDetailsData?.id ?? null;
    this.survey_name = surveyDetailsData?.name || '';
    this.focal_species = surveyDetailsData?.focal_species || [];
    this.ancillary_species = surveyDetailsData?.ancillary_species || [];
    this.start_date = surveyDetailsData?.start_date || '';
    this.end_date = surveyDetailsData?.end_date || '';
    this.common_survey_methodology_id = surveyDetailsData?.common_survey_methodology_id ?? null;
    this.biologist_first_name = surveyDetailsData?.lead_first_name || '';
    this.biologist_last_name = surveyDetailsData?.lead_last_name || '';
    this.survey_area_name = surveyDetailsData?.location_name || '';
    this.geometry = (surveyDetailsData?.geometry?.length && surveyDetailsData.geometry) || [];
    this.permit_number = surveyDetailsData?.number || '';
    this.permit_type = surveyDetailsData?.type || '';
    this.funding_sources = surveyDetailsData?.pfs_id || [];
    this.revision_count = surveyDetailsData?.revision_count ?? null;
    this.completion_status =
      (surveyDetailsData &&
        surveyDetailsData.end_date &&
        moment(surveyDetailsData.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
    this.publish_date = surveyDetailsData?.publish_date || '';
  }
}

/**
 * Pre-processes PUT /project/{projectId}/survey/{surveyId} survey data for update
 *
 * @export
 * @class PutSurveyDetailsData
 */
export class PutSurveyDetailsData {
  name: string;
  focal_species: number[];
  ancillary_species: number[];
  common_survey_methodology_id: number;
  start_date: string;
  end_date: string;
  lead_first_name: string;
  lead_last_name: string;
  location_name: string;
  geometry: Feature[];
  permit_number: string;
  permit_type: string;
  funding_sources: number[];
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({
      label: 'PutSurveyDetailsData',
      message: 'params',
      obj: {
        ...obj,
        geometry: obj?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });

    this.name = obj?.survey_details?.survey_name || null;
    this.focal_species = (obj?.survey_details?.focal_species?.length && obj.survey_details?.focal_species) || [];
    this.ancillary_species =
      (obj?.survey_details?.ancillary_species?.length && obj.survey_details?.ancillary_species) || [];
    this.start_date = obj?.survey_details?.start_date || null;
    this.end_date = obj?.survey_details?.end_date || null;
    this.common_survey_methodology_id = obj?.survey_details?.common_survey_methodology_id || null;
    this.lead_first_name = obj?.survey_details?.biologist_first_name || null;
    this.lead_last_name = obj?.survey_details?.biologist_last_name || null;
    this.location_name = obj?.survey_details?.survey_area_name || null;
    this.geometry = obj?.survey_details?.geometry || null;
    this.permit_number = obj?.survey_details.permit_number || null;
    this.permit_type = obj?.survey_details.permit_type || null;
    this.funding_sources = (obj?.survey_details?.funding_sources?.length && obj.survey_details?.funding_sources) || [];
    this.revision_count = obj?.survey_details?.revision_count ?? null;
  }
}

/**
 * Pre-processes PUT /project/{projectId}/survey/{surveyId} survey proprietor data for update
 *
 * @export
 * @class PutSurveyProprietorData
 */
export class PutSurveyProprietorData {
  id: number;
  prt_id: number;
  fn_id: number;
  rationale: string;
  proprietor_name: string;
  survey_data_proprietary: boolean;
  disa_required: boolean;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutSurveyProprietorData', message: 'params', obj });

    this.id = obj?.id ?? null;
    this.prt_id = obj?.proprietary_data_category || null;
    this.fn_id = obj?.first_nations_id || null;
    this.rationale = obj?.category_rationale || null;
    this.proprietor_name = (!obj?.first_nations_id && obj?.proprietor_name) || null;
    this.survey_data_proprietary = obj?.survey_data_proprietary === 'true' || false;
    this.disa_required = obj?.data_sharing_agreement_required === 'true' || false;
    this.revision_count = obj?.revision_count ?? null;
  }
}

/**
 * Pre-processes PUT /project/{projectId}/survey/{surveyId} survey purpose and methodology data for update
 *
 * @export
 * @class PutSurveyPurposeAndMethodologyData
 */
export class PutSurveyPurposeAndMethodologyData {
  id: number;
  intended_outcome_id: number;
  field_method_id: number;
  additional_details: string;
  ecological_season_id: number;
  vantage_code_ids: number[];
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutSurveyPurposeAndMethodologyData', message: 'params', obj });

    this.id = obj?.id ?? null;
    this.intended_outcome_id = obj?.intended_outcome_id || null;
    this.field_method_id = obj?.field_method_id || null;
    this.additional_details = obj?.additional_details || null;
    this.ecological_season_id = obj?.ecological_season_id || null;
    this.vantage_code_ids = (obj?.vantage_code_ids?.length && obj.vantage_code_ids) || [];
    this.revision_count = obj?.revision_count ?? null;
  }
}
