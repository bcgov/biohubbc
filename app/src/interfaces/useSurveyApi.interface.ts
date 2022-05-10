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

export interface ISurveyFundingSourceForView {
  pfs_id: number;
  funding_amount: number;
  funding_start_date: string;
  funding_end_date: string;
  agency_name: string;
}

export interface IGetSurveyForViewResponseDetails {
  id: number;
  survey_name: string;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  completion_status: string;
  publish_date: string;
  publish_status: string;
}

export interface IGetSurveyForViewResponsePurposeAndMethodology {
  id: number;
  intended_outcome_id: number;
  additional_details: string;
  field_method_id: number;
  ecological_season_id: number;
  vantage_code_ids: number[];
  surveyed_all_areas: StringBoolean;
}

export interface IGetSurveyForViewResponseProprietor {
  id: number;
  proprietary_data_category_name: string;
  first_nations_name: string;
  category_rationale: string;
  proprietor_name: string;
  disa_required: string;
  first_nations_id?: string;
  proprietor_type_id?: number;
  proprietor_type_name?: string;
  revision_count?: number;
}

export interface IGetSurveyForUpdateResponseDetails {
  id: number;
  survey_name: string;
  focal_species: number[];
  ancillary_species: number[];
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
}

export interface IGetSurveyForUpdateResponsePurposeAndMethodology {
  id?: number;
  intended_outcome_id: number;
  additional_details: string;
  field_method_id: number;
  ecological_season_id: number;
  vantage_code_ids: number[];
  surveyed_all_areas: StringBoolean;
  revision_count?: number;
}

export interface IGetSurveyForUpdateResponseProprietor {
  id?: number;
  proprietary_data_category_name?: string;
  first_nations_name?: string;
  proprietary_data_category?: number;
  first_nations_id?: number;
  category_rationale?: string;
  proprietor_name?: string;
  survey_data_proprietary?: string;
  data_sharing_agreement_required?: string;
  revision_count?: number;
}

/**
 * An interface for a single instance of survey metadata, for update-only use cases.
 *
 * @export
 * @interface IGetSurveyForUpdateResponse
 */
export interface IGetSurveyForUpdateResponse {
  survey_details?: IGetSurveyForUpdateResponseDetails;
  survey_purpose_and_methodology?: IGetSurveyForUpdateResponsePurposeAndMethodology | null;
  survey_proprietor?: IGetSurveyForUpdateResponseProprietor | null;
}

/**
 * An interface for a single instance of survey metadata, for view-only use cases.
 *
 * @export
 * @interface IGetSurveyForViewResponse
 */
export interface IGetSurveyForViewResponse {
  survey_details: IGetSurveyForViewResponseDetails;
  species: IGetSpecies;
  permit: ISurveyPermits;
  purpose_and_methodology: IGetSurveyForViewResponsePurposeAndMethodology;
  funding_sources: ISurveyFundingSourceForView[];
  proprietor: IGetSurveyForViewResponseProprietor;
  occurrence_submission: { id: number | null };
  summary_result: { id: number | null };
}

/**
 * An interface for a single instance of survey metadata, for update-only use cases.
 *
 * @export
 * @interface IUpdateSurveyRequest
 * @extends {IGetSurveyForUpdateResponse}
 */
export type IUpdateSurveyRequest = IGetSurveyForUpdateResponse;

export interface IGetSurveyDetailsResponse {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  publish_status: string;
  completion_status: string;
}

export interface IGetSpecies {
  focal_species: number[];
  focal_species_names: string[];
  ancillary_species: number[];
  ancillary_species_names: string[];
}

export enum UPDATE_GET_SURVEY_ENTITIES {
  survey_details = 'survey_details',
  survey_purpose_and_methodology = 'survey_purpose_and_methodology',
  survey_proprietor = 'survey_proprietor'
}

export interface IGetSurveyAttachment {
  id: number;
  fileName: string;
  fileType: string;
  lastModified: string;
  size: number;
  securityToken: any;
  revisionCount: number;
}

/**
 * Get survey attachments response object.
 *
 * @export
 * @interface IGetSurveyAttachmentsResponse
 */
export interface IGetSurveyAttachmentsResponse {
  attachmentsList: IGetSurveyAttachment[];
}

export interface ISurveyPermits {
  permit_number: string;
  permit_type: string;
}
