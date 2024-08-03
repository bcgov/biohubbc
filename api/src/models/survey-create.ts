import { SurveyStratum } from '../repositories/site-selection-strategy-repository';
import { PostSurveyBlock } from '../repositories/survey-block-repository';
import { ITaxonomy } from '../services/platform-service';
import { PostSurveyLocationData } from './survey-update';

export class PostSurveyObject {
  survey_details: PostSurveyDetailsData;
  species: PostSpeciesData;
  permit: PostPermitData;
  funding_sources: PostFundingSourceData[];
  proprietor: PostProprietorData;
  purpose_and_methodology: PostPurposeAndMethodologyData;
  locations: PostSurveyLocationData[];
  agreements: PostAgreementsData;
  participants: PostParticipationData[];
  partnerships: PostPartnershipsData;
  site_selection: PostSiteSelectionData;
  blocks: PostSurveyBlock[];

  constructor(obj?: any) {
    this.survey_details = (obj?.survey_details && new PostSurveyDetailsData(obj.survey_details)) || null;
    this.species = (obj?.species && new PostSpeciesData(obj.species)) || null;
    this.permit = (obj?.permit && new PostPermitData(obj.permit)) || null;
    this.funding_sources =
      (obj?.funding_sources?.length && obj.funding_sources.map((fs: any) => new PostFundingSourceData(fs))) || [];
    this.proprietor = (obj?.proprietor && new PostProprietorData(obj.proprietor)) || null;
    this.purpose_and_methodology =
      (obj?.purpose_and_methodology && new PostPurposeAndMethodologyData(obj.purpose_and_methodology)) || null;
    this.agreements = (obj?.agreements && new PostAgreementsData(obj.agreements)) || null;
    this.participants =
      (obj?.participants?.length && obj.participants.map((p: any) => new PostParticipationData(p))) || [];
    this.partnerships = (obj?.partnerships && new PostPartnershipsData(obj.partnerships)) || null;
    this.locations = (obj?.locations && obj.locations.map((p: any) => new PostSurveyLocationData(p))) || [];
    this.site_selection = (obj?.site_selection && new PostSiteSelectionData(obj)) || null;
    this.blocks = (obj?.blocks && obj.blocks.map((p: any) => p as PostSurveyBlock)) || [];
  }
}

export class PostSiteSelectionData {
  strategies: string[];
  stratums: SurveyStratum[];

  constructor(obj?: any) {
    this.strategies = obj?.site_selection?.strategies ?? [];
    this.stratums = obj?.site_selection?.stratums ?? [];
  }
}

/**
 * Processes POST /project partnerships data
 *
 * @export
 * @class PostPartnershipsData
 */
export class PostPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    this.indigenous_partnerships = (obj?.indigenous_partnerships.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships.length && obj.stakeholder_partnerships) || [];
  }
}

export class PostFundingSourceData {
  funding_source_id: number;
  amount: number;

  constructor(obj?: any) {
    this.funding_source_id = obj?.funding_source_id || null;
    this.amount = obj?.amount ?? null;
  }
}

export class PostSurveyDetailsData {
  survey_name: string;
  start_date: string;
  end_date: string;
  progress_id: number;
  survey_types: number[];

  constructor(obj?: any) {
    this.survey_name = obj?.survey_name || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.progress_id = obj?.progress_id || null;
    this.survey_types = (obj?.survey_types?.length && obj.survey_types) || [];
  }
}

export class PostSpeciesData {
  focal_species: ITaxonomy[];

  constructor(obj?: any) {
    this.focal_species = (obj?.focal_species?.length && obj.focal_species) || [];
  }
}

export class PostPermitData {
  permits: { permit_number: string; permit_type: string }[];

  constructor(obj?: any) {
    this.permits = obj?.permits || [];
  }
}
export class PostProprietorData {
  prt_id: number;
  fn_id: number;
  rationale: string;
  proprietor_name: string;
  disa_required: boolean;
  survey_data_proprietary: boolean;

  constructor(obj?: any) {
    this.prt_id = obj?.proprietary_data_category || null;
    this.fn_id = obj?.first_nations_id || null;
    this.rationale = obj?.category_rationale || null;
    this.proprietor_name = (!obj?.first_nations_id && obj?.proprietor_name) || null;
    this.disa_required = obj?.disa_required === 'true' || false;
    this.survey_data_proprietary = obj?.survey_data_proprietary === 'true' || false;
  }
}

export class PostPurposeAndMethodologyData {
  intended_outcome_ids: number[];
  additional_details: string;

  constructor(obj?: any) {
    this.intended_outcome_ids = obj?.intended_outcome_ids || [];
    this.additional_details = obj?.additional_details || null;
  }
}

export class PostParticipationData {
  system_user_id: number;
  survey_job_name: string;

  constructor(obj?: any) {
    this.system_user_id = obj?.system_user_id || null;
    this.survey_job_name = obj?.survey_job_name || null;
  }
}

export class PostAgreementsData {
  foippa_requirements_accepted: boolean;
  sedis_procedures_accepted: boolean;

  constructor(obj?: any) {
    this.foippa_requirements_accepted = obj?.foippa_requirements_accepted === 'true' || false;
    this.sedis_procedures_accepted = obj?.sedis_procedures_accepted === 'true' || false;
  }
}
