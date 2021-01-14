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
  common_code: string;
}

// /**
//  * An interface representing the project participation table.
//  *
//  * @export
//  * @interface IProjectParticipation
//  */
// export interface IProjectParticipation {}

/**
 * An interface representing the project proponent table.
 *
 * @export
 * @interface IProponent
 */
export interface IProponent {
  id: number;
  name: string;
  record_effective_date: string;
  record_end_date?: string;
}

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

  /**
   * Creates an instance of PostProjectObject.
   *
   * @param {*} [obj]
   * @memberof PostProjectObject
   */
  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', messaeg: 'params', obj });

    this.name = (obj && obj.name) || null;
    this.objectives = (obj && obj.objectives) || null;
    this.scientific_collection_permit_number = (obj && obj.scientific_collection_permit_number) || null;
    this.management_recovery_action = (obj && obj.management_recovery_action) || null;
    this.location_description = (obj && obj.location_description) || null;
    this.start_date = (obj && obj.start_date) || null;
    this.end_date = (obj && obj.end_date) || null;
    this.results = (obj && obj.results) || null;
    this.caveats = (obj && obj.caveats) || null;
    this.comments = (obj && obj.comments) || null;
  }
}
