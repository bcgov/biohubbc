import { IFormRecord } from './useBioHubApi-interfaces';

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

export interface IProjectFundingAgency {
  id: number;
  funding_agency_project_id: string;
  funding_amount: number;
  funding_start_date: string;
  funding_end_date: string;
}

export interface IFundingAgency {
  id: number;
  name: string;
  record_end_date?: string;
  record_effective_date: string;
}

export interface ILandBasedInvestmentStrategy {
  id: number;
  name: string;
}

export interface IProjectManagementActions {
  id: number;
}

export interface IManagementActionType {
  id: number;
  name: string;
  record_end_date?: string;
  record_effective_date: string;
  description: string;
}

export interface IProjectRegion {
  id: number;
  common_code: string;
}

export interface IProponent {
  id: number;
  name: string;
  record_end_date?: string;
  record_effective_date: string;
}

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
