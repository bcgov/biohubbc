import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project');

/**
 * An interface representing the project table.
 *
 * @export
 * @interface IProject
 */
export interface IProject {
  id: number;
  name: string;
  objectives: string;
  scientific_collection_permit_number: string;
  management_recovery_action: string;
  location_description: string;
  start_date: string;
  end_date: string;
  caveats: string;
  comments: string;
  coordinator_first_name: string;
  coordinator_last_name: string;
  coordinator_email_address: string;
  coordinator_agency_name: string;
  geometry: Feature[];
  focal_species_name_list: string;
  regions_name_list?: string;
}

// /**
//  * An interface representing the project climate initiative table.
//  *
//  * @export
//  * @interface IProjectClimateInitiative
//  */
// export interface IProjectClimateInitiative {}

/**
 * An interface representing the project funding agency table.
 *
 * @export
 * @interface IProjectFundingAgency
 */
export interface IProjectFundingAgency {
  id: number;
  funding_agency_project_id: string;
  funding_amount: number;
  funding_start_date: string;
  funding_end_date: string;
}

/**
 * An interface representing the funding angency table.
 *
 * @export
 * @interface IFundingAgency
 */
export interface IFundingAgency {
  id: number;
  name: string;
  record_effective_date: string;
  record_end_date?: string;
}

/**
 * An interface representing the land based investment strategy table.
 *
 * @export
 * @interface ILandBasedInvestmentStrategy
 */
export interface ILandBasedInvestmentStrategy {
  id: number;
  name: string;
}

/**
 * An interface representing the project management actions table.
 *
 * @export
 * @interface IProjectManagementActions
 */
export interface IProjectManagementActions {
  id: number;
}

/**
 * An interface representing the management action type table.
 *
 * @export
 * @interface IManagementActionType
 */
export interface IManagementActionType {
  id: number;
  name: string;
  record_effective_date: string;
  record_end_date?: string;
  description: string;
}

/**
 * An interface representing the project region table.
 *
 * @export
 * @interface IProjectRegion
 */
export interface IProjectRegion {
  id: number;
  region_name: string;
}

// /**
//  * An interface representing the project participation table.
//  *
//  * @export
//  * @interface IProjectParticipation
//  */
// export interface IProjectParticipation {}

/**
 * Processes all POST /project request data.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  coordinator: PostCoordinatorData;
  permit: PostPermitData;
  project: PostProjectData;
  location: PostLocationData;
  species: PostSpeciesData;
  funding: PostFundingData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.coordinator = (obj?.coordinator && new PostCoordinatorData(obj.coordinator)) || null;
    this.permit = (obj?.permit && new PostPermitData(obj.permit)) || null;
    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.species = (obj?.project && new PostSpeciesData(obj.species)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
    this.funding = (obj?.funding && new PostFundingData(obj.funding)) || null;
  }
}

/**
 * Processes POST /project coordinator data
 *
 * @export
 * @class PostCoordinatorData
 */
export class PostCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: boolean;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostCoordinatorData', message: 'params', obj });

    this.first_name = obj?.first_name || null;
    this.last_name = obj?.last_name || null;
    this.email_address = obj?.email_address || null;
    this.coordinator_agency = obj?.coordinator_agency || null;
    this.share_contact_details = (obj?.share_contact_details === 'true' && true) || false;
  }
}

export interface IPostPermit {
  permit_number: string;
  sampling_conducted: boolean;
}

/**
 * Processes POST /project permit data
 *
 * @export
 * @class PostPermitData
 */
export class PostPermitData {
  permits: IPostPermit[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPermitData', message: 'params', obj });

    this.permits =
      (obj?.permits?.length &&
        obj.permits.map((item: any) => {
          return {
            permit_number: item.permit_number,
            sampling_conducted: (item.sampling_conducted === 'true' && true) || false
          };
        })) ||
      [];
  }
}

/**
 * Processes POST /project project data.
 *
 * @export
 * @class PostProjectData
 */
export class PostProjectData {
  name: string;
  type: string;
  objectives: string;
  scientific_collection_permit_number: string;
  management_recovery_action: string;
  start_date: string;
  end_date: string;
  caveats: string;
  comments: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.type = obj?.type || null;
    this.objectives = obj?.objectives || '';
    this.scientific_collection_permit_number = obj?.scientific_collection_permit_number || null;
    this.management_recovery_action = obj?.management_recovery_action || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.caveats = obj?.caveats || null;
    this.comments = obj?.comments || null;
  }
}

/**
 * Processes POST /project location data
 *
 * @export
 * @class PostLocationData
 */
export class PostLocationData {
  location_description: string;
  regions: string[];
  geometry: Feature[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostLocationData', message: 'params', obj });

    this.location_description = (obj && obj.location_description) || null;
    this.regions = (obj?.regions?.length && obj.regions) || [];
    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
  }
}

/**
 * Processes POST /project species data
 *
 * @export
 * @class PostSpeciesData
 */
export class PostSpeciesData {
  focal_species: string[];
  ancillary_species: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSpeciesData', message: 'params', obj });

    this.focal_species = (obj?.focal_species.length && obj?.focal_species) || [];
    this.ancillary_species = (obj?.ancillary_species.length && obj?.ancillary_species) || [];
  }
}

/**
 * A single project funding agency.
 *
 * @See PostFundingData
 *
 * @export
 * @class PostLocationData
 */
export class PostFundingSource {
  agency_id: number;
  investment_action_category: number;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingSource', message: 'params', obj });

    this.agency_id = obj?.agency_id || null;
    this.investment_action_category = obj?.investment_action_category || null;
    this.agency_project_id = obj?.agency_project_id || null;
    this.funding_amount = obj?.funding_amount || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
  }
}

/**
 * Processes POST /project location data
 *
 * @export
 * @class PostLocationData
 */
export class PostFundingData {
  funding_agencies: PostFundingSource[];
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingData', message: 'params', obj });

    this.funding_agencies =
      (obj?.funding_agencies.length && obj.funding_agencies.map((item: any) => new PostFundingSource(item))) || [];
    this.indigenous_partnerships = (obj?.indigenous_partnerships.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships.length && obj.stakeholder_partnerships) || [];
  }
}
