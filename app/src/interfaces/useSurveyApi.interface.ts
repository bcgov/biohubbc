import { IAgreementsForm } from 'features/surveys/components/AgreementsForm';
import { IGeneralInformationForm } from 'features/surveys/components/GeneralInformationForm';
import { IProprietaryDataForm } from 'features/surveys/components/ProprietaryDataForm';
import { IPurposeAndMethodologyForm } from 'features/surveys/components/PurposeAndMethodologyForm';
import { IStudyAreaForm } from 'features/surveys/components/StudyAreaForm';
import { Feature } from 'geojson';
import { IGetProjectForUpdateResponseFundingSource } from 'interfaces/useProjectApi.interface';
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

export interface ISurveyFundingSources {
  funding_sources: ISurveyFundingSourceForView[];
}

export interface ISurveyFundingSourceForView {
  pfs_id: number;
  funding_amount: number;
  funding_start_date: string;
  funding_end_date: string;
  agency_name: string;
}

export type ISurveyAvailableFundingSources = IGetProjectForUpdateResponseFundingSource;

export interface IGetSurveyForViewResponseDetails {
  id: number;
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
  funding: ISurveyFundingSources;
  proprietor: IGetSurveyForViewResponseProprietor | null;
  docs_to_be_reviewed: number;
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
  funding?: {
    funding_sources: number[];
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
  occurrence_submission: { id: number | null };
  summary_result: { id: number | null };
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
  securityToken: any;
  securityReviewTimestamp: string;
  revisionCount: number;
  securityRuleCount?: number;
}

export type IGetSurveyReportAttachment = IGetSurveyAttachment & { fileType: 'Report' };

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
