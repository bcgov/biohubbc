import { PublishStatus } from 'constants/attachments';
import { IAgreementsForm } from 'features/surveys/components/AgreementsForm';
import { IGeneralInformationForm } from 'features/surveys/components/GeneralInformationForm';
import { IProprietaryDataForm } from 'features/surveys/components/ProprietaryDataForm';
import { IPurposeAndMethodologyForm } from 'features/surveys/components/PurposeAndMethodologyForm';
import { IStudyAreaForm } from 'features/surveys/components/StudyAreaForm';
import { Feature } from 'geojson';
import { StringBoolean } from 'types/misc';

/**
 * Create survey post object.
 *
 * @export
 * @interface ICreateSurveyRequest
 */
export interface ICreateSurveyRequest
  extends IGeneralInformationForm,
    IPurposeAndMethodologyForm,
    IStudyAreaForm,
    IProprietaryDataForm,
    IAgreementsForm {}

/**
 * Create survey response object.
 *
 * @export
 * @interface ICreateSurveyResponse
 */
export interface ICreateSurveyResponse {
  id: number;
}
export interface IGetSurveyForViewResponseDetails {
  id: number;
  project_id: number;
  survey_name: string;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;
}

export interface IGetSurveyForViewResponsePurposeAndMethodology {
  intended_outcome_id: number;
  additional_details: string;
  field_method_id: number;
  ecological_season_id: number;
  vantage_code_ids: number[];
  surveyed_all_areas: StringBoolean;
}

export interface IGetSurveyForViewResponseProprietor {
  proprietary_data_category_name: string;
  first_nations_name: string;
  category_rationale: string;
  proprietor_name: string;
  disa_required: boolean;
  first_nations_id?: number;
  proprietor_type_id?: number;
  proprietor_type_name?: string;
}

export interface SurveyViewObject {
  survey_details: IGetSurveyForViewResponseDetails;
  species: IGetSpecies;
  permit: ISurveyPermits;
  purpose_and_methodology: IGetSurveyForViewResponsePurposeAndMethodology;
  proprietor: IGetSurveyForViewResponseProprietor | null;
}

export interface SurveyUpdateObject {
  survey_details?: {
    survey_name: string;
    start_date: string;
    end_date: string;
    biologist_first_name: string;
    biologist_last_name: string;
    revision_count: number;
  };
  species?: {
    focal_species: number[];
    ancillary_species: number[];
  };
  permit?: {
    permits: {
      permit_id?: number;
      permit_number: string;
      permit_type: string;
    }[];
  };
  purpose_and_methodology?: {
    intended_outcome_id: number;
    additional_details: string;
    field_method_id: number;
    ecological_season_id: number;
    vantage_code_ids: number[];
    surveyed_all_areas: StringBoolean;
    revision_count: number;
  };
  proprietor?: {
    survey_data_proprietary: StringBoolean;
    proprietary_data_category: number;
    proprietor_name: string;
    first_nations_id: number;
    category_rationale: string;
    disa_required: StringBoolean;
  };
  location?: {
    survey_area_name: string;
    geometry: Feature[];
    revision_count: number;
  };
}

export interface SurveySupplementaryData {
  occurrence_submission: {
    occurrence_submission_id: number | null;
  };
  occurrence_submission_publish: {
    occurrence_submission_publish_id: number;
    occurrence_submission_id: number;
    event_timestamp: string;
    queue_id: number;
    create_date: string;
    create_user: number;
    update_date: string | null;
    update_user: number | null;
    revision_count: number;
  } | null;
  survey_summary_submission: {
    survey_summary_submission_id: number | null;
  };
  survey_summary_submission_publish: {
    survey_summary_submission_publish_id: number;
    survey_summary_submission_id: number;
    event_timestamp: string;
    artifact_revision_id: number;
    create_date: string;
    create_user: number;
    update_date: string | null;
    update_user: number | null;
    revision_count: number;
  } | null;
  survey_metadata_publish: {
    survey_metadata_publish_id: number;
    survey_id: number;
    event_timestamp: string;
    queue_id: number;
    create_date: string;
    create_user: number;
    update_date: string | null;
    update_user: number | null;
    revision_count: number;
  } | null;
}

/**
 * An interface describing Survey Publish Data
 *
 * @export
 * @interface ISurveySupplementaryData
 */
export interface ISurveySupplementaryData {
  publishStatus: PublishStatus;
}

/**
 * Get Survey list response object.
 *
 * @export
 * @interface IGetSurveyForListResponse
 */
export interface IGetSurveyForListResponse {
  surveyData: SurveyViewObject;
  surveySupplementaryData: ISurveySupplementaryData;
}

/**
 * An interface for a single instance of survey metadata, for view-only use cases.
 *
 * @export
 * @interface IGetSurveyForViewResponse
 */
export interface IGetSurveyForViewResponse {
  surveyData: SurveyViewObject;
  surveySupplementaryData: SurveySupplementaryData;
}

export interface IGetSurveyDetailsResponse {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  completion_status: string;
}

export interface IGetSpecies {
  focal_species: number[];
  focal_species_names: string[];
  ancillary_species: number[];
  ancillary_species_names: string[];
}

export interface IGetSurveyAttachment {
  id: number;
  fileName: string;
  fileType: string;
  lastModified: string;
  size: number;
  revisionCount: number;
  supplementaryAttachmentData: ISurveySupplementaryAttachmentData | ISurveySupplementaryReportAttachmentData | null;
}

export type IGetSurveyReportAttachment = IGetSurveyAttachment & { fileType: 'Report' };

export interface ISurveySupplementaryAttachmentData {
  survey_attachment_publish_id: number;
  survey_attachment_id: number;
  event_timestamp: string;
  artifact_revision_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface ISurveySupplementaryReportAttachmentData {
  survey_report_publish_id: number;
  survey_report_attachment_id: number;
  event_timestamp: string;
  artifact_revision_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

/**
 * Get survey attachments response object.
 *
 * @export
 * @interface IGetSurveyAttachmentsResponse
 */
export interface IGetSurveyAttachmentsResponse {
  attachmentsList: IGetSurveyAttachment[];
  reportAttachmentsList: IGetSurveyReportAttachment[];
}

export interface ISurveyPermits {
  permits: {
    id: number;
    permit_number: string;
    permit_type: string;
  }[];
}

export interface IUpdateAgreementsForm {
  agreements: {
    sedis_procedures_accepted: StringBoolean;
    foippa_requirements_accepted: StringBoolean;
  };
}

export interface IGetSurveyForUpdateResponse {
  surveyData: SurveyUpdateObject;
}

export interface IEditSurveyRequest
  extends IGeneralInformationForm,
    IPurposeAndMethodologyForm,
    IStudyAreaForm,
    IProprietaryDataForm,
    IUpdateAgreementsForm {}
