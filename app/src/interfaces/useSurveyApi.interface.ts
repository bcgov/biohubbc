import { PublishStatus } from 'constants/attachments';
import { IAgreementsForm } from 'features/surveys/components/agreements/AgreementsForm';
import { IProprietaryDataForm } from 'features/surveys/components/agreements/ProprietaryDataForm';
import { ISurveyBlock } from 'features/surveys/components/areas/blocks/form/SurveyBlocksForm';
import { ISurveyLocationForm } from 'features/surveys/components/areas/SurveyAreaFormContainer';
import {
  ISurveyFundingSource,
  ISurveyFundingSourceForm
} from 'features/surveys/components/funding/SurveyFundingSourceForm';
import { IGeneralInformationForm } from 'features/surveys/components/general-information/GeneralInformationForm';
import { IPurposeAndMethodologyForm } from 'features/surveys/components/methodology/PurposeAndMethodologyForm';
import { ISurveyPermitForm } from 'features/surveys/components/permit/SurveyPermitForm';
import { ISpeciesForm, ITaxonomyWithEcologicalUnits } from 'features/surveys/components/species/SpeciesForm';
import { ISurveyPartnershipsForm } from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Feature } from 'geojson';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { IAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
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
    ISurveyPartnershipsForm,
    ISurveySiteSelectionForm,
    ISpeciesForm,
    Omit<ISurveyFundingSourceForm, 'funding_used'>,
    Omit<ISurveyPermitForm, 'permit_used'> {}

/**
 * Create survey response object.
 *
 * @export
 * @interface ICreateSurveyResponse
 */
export interface ICreateSurveyResponse {
  id: number;
}

export interface IGetSurveyStratumForm {
  index: number | null;
  stratum: IGetSurveyStratum | IPostSurveyStratum;
}

export interface IPostSurveyStratum {
  survey_stratum_id: number | null;
  name: string;
  description: string | null;
}

export interface ISurveySiteSelectionForm {
  site_selection: {
    strategies: string[];
    stratums: IPostSurveyStratum[];
  };
}

export interface ISurveyBlockForm {
  blocks: ISurveyBlock[];
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
  geojson: Feature[];
  revision_count: number;
}

export interface IGetSurveyBlock {
  survey_block_id: number;
  name: string;
  description: string;
  revision_count: number;
  sample_block_count: number;
}

export interface IGetSurveyStratum {
  survey_stratum_id: number;
  name: string;
  description: string;
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
  project_id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  progress_id: number;
  focal_species: number[];
  focal_species_names: string[];
  regions: string[];
  types: number[];
}

export type IUpdateSurveyRequest = ISurveyLocationForm & {
  survey_details: {
    survey_name: string;
    progress_id: number;
    start_date: string;
    end_date: string;
    survey_types: number[];
    revision_count: number;
  };
  species: {
    focal_species: ITaxonomyWithEcologicalUnits[];
  };
  permit: {
    permits: {
      permit_id?: number | null;
      permit_number: string;
      permit_type: string;
    }[];
  };
  funding_sources: {
    funding_source_id: number;
    amount: number;
    revision_count: number;
  }[];
  partnerships: IGetSurveyForUpdateResponsePartnerships;
  purpose_and_methodology: {
    intended_outcome_ids: number[];
    additional_details: string;
    revision_count: number;
  };
  proprietor: {
    survey_data_proprietary: StringBoolean;
    proprietary_data_category: number;
    proprietor_name: string;
    first_nations_id: number;
    category_rationale: string;
    disa_required: StringBoolean;
  };
  participants: IGetSurveyParticipant[];
  blocks: ISurveyBlock[];
  site_selection: {
    strategies: string[];
    stratums: {
      survey_stratum_id: number | null;
      name: string;
      description: string | null;
    }[];
  };
  agreements: {
    sedis_procedures_accepted: StringBoolean;
    foippa_requirements_accepted: StringBoolean;
  };
};

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
 * Find surveys basic fields response object.
 *
 * @export
 * @interface IFindSurveysResponse
 */
export interface IFindSurveysResponse {
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

export interface IGetSpecies {
  focal_species: ITaxonomy[];
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
  surveyData: {
    survey_details: {
      id: number;
      project_id: number;
      uuid: string;
      survey_name: string;
      start_date: string;
      end_date: string;
      progress_id: number;
      survey_types: number[];
      revision_count: number;
    };
    species: {
      focal_species: ITaxonomyWithEcologicalUnits[];
    };
    permit: {
      permits: {
        permit_id: number;
        permit_number: string;
        permit_type: string;
      }[];
    };
    funding_sources: {
      funding_source_id: number;
      survey_id: number;
      survey_funding_source_id: number;
      amount: number;
      funding_source_name: string;
      start_date: string | null;
      end_date: string | null;
      description: string | null;
      revision_count: number;
    }[];
    partnerships: IGetSurveyForUpdateResponsePartnerships;
    purpose_and_methodology: {
      intended_outcome_ids: number[];
      additional_details: string;
      revision_count: number;
    };
    proprietor: {
      proprietor_type_name: string;
      proprietor_type_id: number;
      first_nations_name: string | null;
      first_nations_id: number;
      category_rationale: string;
      proprietor_name: string;
      disa_required: StringBoolean;
      survey_data_proprietary: StringBoolean;
      proprietary_data_category: number;
    };
    locations: {
      survey_id: number;
      survey_location_id: number;
      name: string;
      description: string;
      geometry: null;
      geography: string;
      geojson: Feature[];
      revision_count: number;
    }[];
    participants: {
      system_user_id: number;
      user_identifier: string;
      user_guid: string;
      record_end_date: string | null;
      identity_source: string;
      role_ids: number[];
      role_names: string[];
      email: string;
      display_name: string;
      given_name: string | null;
      family_name: string | null;
      agency: string | null;
      survey_participation_id: number;
      survey_id: number;
      survey_job_id: number;
      survey_job_name: string;
    }[];
    site_selection: {
      strategies: string[];
      stratums: {
        survey_stratum_id: number;
        survey_id: number;
        name: string;
        description: 's1111';
        sample_stratum_count: number;
        revision_count: number;
      }[];
    };
    blocks: {
      survey_block_id: number;
      survey_id: number;
      name: string;
      description: string;
      geometry: null;
      geography: string;
      geojson: Feature[];
      sample_block_count: number;
      revision_count: number;
    }[];
    agreements: {
      sedis_procedures_accepted: StringBoolean;
      foippa_requirements_accepted: StringBoolean;
    };
  };
}

export interface IDetailedCritterWithInternalId extends ICritterDetailedResponse {
  critter_id: number; //The internal critter_id in the SIMS DB. Called this to distinguish against the critterbase UUID of the same name.
}

export interface IAnimalDeploymentWithCritter {
  deployment: IAnimalDeployment;
  critter: ICritterSimpleResponse;
}

export type IEditSurveyRequest = IGeneralInformationForm &
  ISpeciesForm &
  IPurposeAndMethodologyForm &
  ISurveyLocationForm &
  IProprietaryDataForm &
  IUpdateAgreementsForm & { partnerships: IGetSurveyForViewResponsePartnerships } & ISurveySiteSelectionForm &
  IParticipantsJobForm &
  ISurveyBlockForm &
  ISurveyPermitForm &
  ISurveyFundingSourceForm;
