import { Feature } from 'geojson';
import { SurveyStratum, SurveyStratumRecord } from '../repositories/site-selection-strategy-repository';
import { PostSurveyBlock } from '../repositories/survey-block-repository';
import { ITaxonomy } from '../services/platform-service';

export class PutSurveyObject {
  survey_details: PutSurveyDetailsData;
  species: PutSurveySpeciesData;
  permit: PutSurveyPermitData;
  funding_sources: PutFundingSourceData[];
  proprietor: PutSurveyProprietorData;
  purpose_and_methodology: PutSurveyPurposeAndMethodologyData;
  locations: PostSurveyLocationData[];
  participants: PutSurveyParticipantsData[];
  partnerships: PutPartnershipsData;
  site_selection: PutSiteSelectionData;
  blocks: PostSurveyBlock[];

  constructor(obj?: any) {
    this.survey_details = (obj?.survey_details && new PutSurveyDetailsData(obj.survey_details)) || null;
    this.species = (obj?.species && new PutSurveySpeciesData(obj.species)) || null;
    this.permit = (obj?.permit && new PutSurveyPermitData(obj.permit)) || null;
    this.funding_sources =
      (obj?.funding_sources?.length && obj.funding_sources.map((fs: any) => new PutFundingSourceData(fs))) || [];
    this.proprietor = (obj?.proprietor && new PutSurveyProprietorData(obj.proprietor)) || null;
    this.purpose_and_methodology =
      (obj?.purpose_and_methodology && new PutSurveyPurposeAndMethodologyData(obj.purpose_and_methodology)) || null;
    this.participants =
      (obj?.participants?.length && obj.participants.map((p: any) => new PutSurveyParticipantsData(p))) || [];
    this.locations = (obj?.locations && obj.locations.map((p: any) => new PostSurveyLocationData(p))) || [];
    this.partnerships = (obj?.partnerships && new PutPartnershipsData(obj.partnerships)) || null;
    this.site_selection = (obj?.site_selection && new PutSiteSelectionData(obj)) || null;
    this.blocks = (obj?.blocks && obj.blocks.map((p: any) => p as PostSurveyBlock)) || [];
  }
}

export class PutSiteSelectionData {
  strategies: string[];
  stratums: Array<SurveyStratum | SurveyStratumRecord>;

  constructor(obj?: any) {
    this.strategies = obj?.site_selection?.strategies ?? [];
    this.stratums = obj?.site_selection?.stratums ?? [];
  }
}

export class PutPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    this.indigenous_partnerships = (obj?.indigenous_partnerships?.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships?.length && obj.stakeholder_partnerships) || [];
  }
}

export class PutSurveyParticipantsData {
  survey_participation_id?: number;
  system_user_id: number;
  survey_job_name: string;

  constructor(obj?: any) {
    this.survey_participation_id = obj?.survey_participation_id || null;
    this.system_user_id = obj?.system_user_id || null;
    this.survey_job_name = obj?.survey_job_name || null;
  }
}

export class PutFundingSourceData {
  survey_funding_source_id?: number;
  funding_source_id: number;
  amount: number;
  revision_count?: number;

  constructor(obj?: any) {
    this.survey_funding_source_id = obj?.survey_funding_source_id || null;
    this.funding_source_id = obj?.funding_source_id || null;
    this.amount = obj?.amount ?? null;
    this.revision_count = obj?.revision_count || 0;
  }
}

export class PutSurveyDetailsData {
  name: string;
  start_date: string;
  end_date: string;
  survey_types: number[];
  revision_count: number;

  constructor(obj?: any) {
    this.name = obj?.survey_name || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.survey_types = (obj?.survey_types?.length && obj.survey_types) || [];
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutSurveySpeciesData {
  focal_species: ITaxonomy[];
  ancillary_species: ITaxonomy[];

  constructor(obj?: any) {
    this.focal_species = (obj?.focal_species?.length && obj?.focal_species) || [];
    this.ancillary_species = (obj?.ancillary_species?.length && obj?.ancillary_species) || [];
  }
}

export class PutSurveyPermitData {
  permits: { permit_id?: number; permit_number: string; permit_type: string }[];

  constructor(obj?: any) {
    this.permits = obj?.permits || [];
  }
}

export class PutSurveyProprietorData {
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
export class PutSurveyPurposeAndMethodologyData {
  intended_outcome_ids: number[];
  additional_details: string;
  vantage_code_ids: number[];
  surveyed_all_areas: boolean;
  revision_count: number;

  constructor(obj?: any) {
    this.intended_outcome_ids = (obj?.intended_outcome_ids?.length && obj?.intended_outcome_ids) || [];
    this.additional_details = obj?.additional_details || null;
    this.vantage_code_ids = (obj?.vantage_code_ids?.length && obj.vantage_code_ids) || [];
    this.surveyed_all_areas = obj?.surveyed_all_areas === 'true' || false;
    this.revision_count = obj?.revision_count ?? null;
  }
}

// This class is used for both insert and updating a survey location
export class PostSurveyLocationData {
  survey_location_id: number | undefined;
  name: string;
  description: string;
  geojson: Feature[];
  revision_count: number | undefined;

  constructor(obj?: any) {
    this.survey_location_id = obj?.survey_location_id || null;
    this.name = obj?.name || null;
    this.description = obj?.description || '';
    this.geojson = (obj?.geojson?.length && obj.geojson) || [];
    this.revision_count = obj?.revision_count ?? null;
  }
}
