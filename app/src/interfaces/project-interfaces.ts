import { IFormRecord } from './useBioHubApi-interfaces';

// TODO everything on this page is a WIP

// project
//   project_climate_initiative
//   project_funding_agency
//     funding_agency
//     land_based_investment_strategy
//   project_management_actions
//     management_action_type
//   project_participation
//     system_user
//     project_role
//   project_region
//   proponent

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
 * An interface representing a single project record, in its entirety.
 *
 * @export
 * @interface IProjectRecord
 * @extends {IFormRecord}
 */
export interface IProjectRecord extends IFormRecord {
  id: number;
  project: IProject;
  fundingAgency: {
    fundingAgency: IProjectFundingAgency;
    agency: IFundingAgency;
    landBasedClimateStrategy: ILandBasedInvestmentStrategy;
  };
  managementActions: {
    managementActions: IProjectManagementActions;
    actionType: IManagementActionType;
  };
  region: IProjectRegion;
  proponent: IProponent;
}

// TODO this is an interim (incomplete) version of the final project post object
export interface IProjectPostObject {
  project: IProject;
  proponent: IProponent;
  funding: IProjectFundingAgency;
  agency: IFundingAgency;
}
