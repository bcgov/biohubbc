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
  results: string;
  caveats: string;
  comments: string;
  coordinator_first_name: string;
  coordinator_last_name: string;
  coordinator_email_address: string;
  coordinator_agency_name: string;
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
 * Model for the project table.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  name: string;
  objectives: string;
  scientific_collection_permit_number: string;
  management_recovery_action: string;
  location_description: string;
  start_date: string;
  end_date: string;
  results: string;
  caveats: string;
  comments: string;
  coordinator_first_name: string;
  coordinator_last_name: string;
  coordinator_email_address: string;
  coordinator_agency_name: string;

  /**
   * Creates an instance of PostProjectObject.
   *
   * @param {*} [obj]
   * @memberof PostProjectObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.name = (obj && obj.project && obj.project.name) || null;
    this.objectives = (obj && obj.project && obj.project.objectives) || null;
    this.scientific_collection_permit_number = (obj && obj.project && obj.project.scientific_collection_permit_number) || null;
    this.management_recovery_action = (obj && obj.project && obj.project.management_recovery_action) || null;
    this.start_date = (obj && obj.project && obj.project.start_date) || null;
    this.end_date = (obj && obj.project && obj.project.end_date) || null;
    this.results = (obj && obj.project && obj.project.results) || null;
    this.caveats = (obj && obj.project && obj.project.caveats) || null;
    this.comments = (obj && obj.project && obj.project.comments) || null;
    this.coordinator_first_name = (obj && obj.project && obj.project.coordinator_first_name) || null;
    this.coordinator_last_name = (obj && obj.project && obj.project.coordinator_last_name) || null;
    this.coordinator_email_address = (obj && obj.project && obj.project.coordinator_email_address) || null;
    this.coordinator_agency_name = (obj && obj.project && obj.project.coordinator_agency_name) || null;
    this.location_description = (obj && obj.location && obj.location.location_description) || null;
  }
}

/**
 * Model for the focal and ancillary species table.
 *
 * @export
 * @class PostSpeciesObject
 */
export class PostSpeciesObject {
  name: string;
  uniform_resource_locator: string;

  /**
   * Creates an instance of PostSpeciesObject.
   *
   * @param {*} [obj]
   * @memberof PostSpeciesObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostSpeciesObject', message: 'params', obj });

    this.name = (obj && obj.name) || null;
    this.uniform_resource_locator = (obj && obj.uniform_resource_locator) || null;
  }
}



/**
 * Model for the project region table.
 *
 * @export
 * @class PostProjectRegionObject
 */
export class PostProjectRegionObject {
  region_name: string;

  /**
   * Creates an instance of PostProjectRegionObject.
   *
   * @param {*} [obj]
   * @memberof PostProjectRegionObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectRegionObject', message: 'params', obj });

    this.region_name = (obj && obj.name) || null;
  }
}