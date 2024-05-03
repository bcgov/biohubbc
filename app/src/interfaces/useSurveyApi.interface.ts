import { PublishStatus } from 'constants/attachments';
import { IAgreementsForm } from 'features/surveys/components/AgreementsForm';
import { IGeneralInformationForm } from 'features/surveys/components/GeneralInformationForm';
import { IProprietaryDataForm } from 'features/surveys/components/ProprietaryDataForm';
import { IPurposeAndMethodologyForm } from 'features/surveys/components/PurposeAndMethodologyForm';
import { ISurveyLocationForm } from 'features/surveys/components/StudyAreaForm';
import { ISurveyFundingSource, ISurveyFundingSourceForm } from 'features/surveys/components/SurveyFundingSourceForm';
import { ISurveySiteSelectionForm } from 'features/surveys/components/SurveySiteSelectionForm';
import { Feature } from 'geojson';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { ApiPaginationResponseParams, StringBoolean } from 'types/misc';
import { ICritterDetailedResponse, ICritterSimpleResponse } from './useCritterApi.interface';

/**
 * Create survey post object.
 *
 * @export
 * @interface ICreateSurveyRequest
 */
export interface ICreateSurveyRequest
  extends IGeneralInformationForm,
    IPurposeAndMethodologyForm,
    IProprietaryDataForm,
    IAgreementsForm,
    IParticipantsJobForm,
    ISurveyLocationForm,
    ISurveyBlockForm {}

/**
 * Create survey response object.
 *
 * @export
 * @interface ICreateSurveyResponse
 */
export interface ICreateSurveyResponse {
  id: number;
}

export interface ISurveyBlockForm {
  blocks: {
    survey_block_id: number | null;
    name: string;
    description: string;
    sample_block_count: number;
  }[];
}

export interface IParticipantsJobForm {
  participants: IGetSurveyParticipant[];
}

export interface IGetSurveyForViewResponseDetails {
  id: number;
  project_id: number;
  survey_name: string;
  start_date: string;
  end_date: string;
  progress_id: number;
  survey_types: number[];
  revision_count: number;
}

export interface IGetSurveyForViewResponsePurposeAndMethodology {
  intended_outcome_ids: number[];
  additional_details: string;
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
export interface IGetSurveyParticipant {
  system_user_id: number;
  identity_source: string;
  email: string | null;
  display_name: string;
  agency: string | null;
  survey_job_id: number;
  survey_job_name: string;
}

export interface IGetSurveyForViewResponsePartnerships {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

export interface IGetSurveyForUpdateResponsePartnerships {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

export interface IGetSurveyLocation {
  survey_location_id: number;
  name: string;
  description: string;
  geometry: Feature[];
  geography: string | null;
  geojson: Feature[];
  revision_count: number;
}

export interface IGetSurveyBlock {
  survey_block_id: number;
  name: string;
  description: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  sample_block_count: number;
}

export interface IGetSurveyStratum {
  survey_stratum_id: number;
  name: string;
  description: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  sample_stratum_count: number;
}

export interface SurveyViewObject {
  survey_details: IGetSurveyForViewResponseDetails;
  species: IGetSpecies;
  permit: ISurveyPermits;
  purpose_and_methodology: IGetSurveyForViewResponsePurposeAndMethodology;
  funding_sources: ISurveyFundingSource[];
  site_selection: ISurveySiteSelectionForm['site_selection'];
  proprietor: IGetSurveyForViewResponseProprietor | null;
  participants: IGetSurveyParticipant[];
  partnerships: IGetSurveyForViewResponsePartnerships;
  locations: IGetSurveyLocation[];
  blocks: IGetSurveyBlock[];
}

export interface SurveyBasicFieldsObject {
  survey_id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  progress_id: number;
  focal_species: number[];
  focal_species_names: string[];
}

export interface SurveyUpdateObject extends ISurveyLocationForm {
  survey_details?: {
    survey_name: string;
    start_date: string;
    end_date: string;
    survey_types: number[];
    revision_count: number;
  };
  species?: {
    focal_species: ITaxonomy[];
    ancillary_species: ITaxonomy[];
  };
  permit?: {
    permits: {
      permit_id?: number;
      permit_number: string;
      permit_type: string;
    }[];
  };
  funding_sources?: [
    {
      funding_source_id?: number;
      amount: number;
      revision_count: number;
    }
  ];
  partnerships?: IGetSurveyForUpdateResponsePartnerships;
  purpose_and_methodology?: {
    intended_outcome_ids: number[];
    additional_details: string;
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
  participants?: IGetSurveyParticipant[];
}

export interface SurveySupplementaryData {
  survey_metadata_publish: {
    survey_metadata_publish_id: number;
    survey_id: number;
    event_timestamp: string;
    submission_uuid: string;
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
 * Get survey basic fields response object.
 *
 * @export
 * @interface IGetSurveyListResponse
 */
export interface IGetSurveyListResponse {
  surveys: SurveyBasicFieldsObject[];
  pagination: ApiPaginationResponseParams;
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
  focal_species: ITaxonomy[];
  ancillary_species: ITaxonomy[];
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
    permit_id: number;
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

export interface ISimpleCritterWithInternalId extends ICritterSimpleResponse {
  survey_critter_id: number;
}

export interface IDetailedCritterWithInternalId extends ICritterDetailedResponse {
  survey_critter_id: number; //The internal critter_id in the SIMS DB. Called this to distinguish against the critterbase UUID of the same name.
}

export type IEditSurveyRequest = IGeneralInformationForm &
  IPurposeAndMethodologyForm &
  ISurveyFundingSourceForm &
  ISurveyLocationForm &
  IProprietaryDataForm &
  IUpdateAgreementsForm & { partnerships: IGetSurveyForViewResponsePartnerships } & ISurveySiteSelectionForm &
  IParticipantsJobForm &
  ISurveyBlockForm;

export interface IGetSampleSiteResponse {
  sampleSites: IGetSampleLocationDetails[];
}

export interface IGetSampleLocationRecord {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  geography: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface IGetSampleLocationDetails {
  survey_sample_site_id: number;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  geography: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  sample_methods: IGetSampleMethodRecord[];
  sample_blocks: IGetSampleBlockDetails[];
  sample_stratums: IGetSampleStratumDetails[];
}

export interface IGetSampleBlockDetails {
  survey_sample_block_id: number;
  survey_sample_site_id: number;
  survey_block_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  name: string;
  description: string;
}

export interface IGetSampleStratumDetails {
  survey_sample_stratum_id: number;
  survey_sample_site_id: number;
  survey_stratum_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  name: string;
  description: string;
}

export interface IGetSampleMethodRecord {
  survey_sample_method_id: number;
  survey_sample_site_id: number;
  method_lookup_id: number;
  method_response_metric_id: number;
  description: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  sample_periods: IGetSamplePeriodRecord[] | undefined;
}

export interface IGetSamplePeriodRecord {
  survey_sample_period_id: number;
  survey_sample_method_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}
