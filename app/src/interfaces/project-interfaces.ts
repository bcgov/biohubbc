import { IFormRecord } from './useBioHubApi-interfaces';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';

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
  location_description: string;
  start_date: string;
  end_date: string;
  caveats: string;
  comments: string;
  coordinator_first_name: string;
  coordinator_last_name: string;
  coordinator_email_address: string;
  coordinator_agency_name: string;
  focal_species_name_list: string;
  regions_name_list: string;
}

/**
 * An interface representing the IUCN classification detail item fields for GET
 *
 * @interface IProjectIUCNArrayItem
 */
interface IProjectIUCNArrayItem {
  classification: string;
  subClassification1: string;
  subClassification2: string;
}

/**
 * An interface representing the IUCN classification details for GET
 *
 * @interface IProjectIUCN
 */
interface IProjectIUCN {
  classificationDetails: IProjectIUCNArrayItem[];
}

/**
 * An interface representing the funding agency item fields for GET
 *
 * @interface IProjectFundingSourceArrayItem
 */
interface IProjectFundingSourceArrayItem {
  agency_id: string;
  agency_name: string;
  investment_action_category: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
}

/**
 * An interface representing the funding source for GET
 *
 * @interface IProjectFundingSource
 */
interface IProjectFundingSource {
  fundingAgencies: IProjectFundingSourceArrayItem[];
}

/**
 * An interface representing the project table.
 *
 * @export
 * @interface IProject
 */
export interface IProjectWithDetails {
  id: number;
  project: IProjectDetailsForm;
  objectives: IProjectObjectivesForm;
  location: IProjectLocationForm;
  coordinator: IProjectCoordinatorForm;
  iucn: IProjectIUCN;
  funding: IProjectFundingSource;
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

export interface ISpecies {
  id: number;
  focal_species: string[];
  ancillary_species: string[];
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
 * TODO eventually use as the return type when fetching a project
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
    landBasedClimateStrategy: ILandBasedInvestmentStrategy;
  };
  managementActions: {
    managementActions: IProjectManagementActions;
    actionType: IManagementActionType;
  };
  region: IProjectRegion;
  proponent: IProponent;
}
