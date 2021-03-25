import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectFundingForm } from 'features/projects/components/ProjectFundingForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectPartnershipsForm } from 'features/projects/components/ProjectPartnershipsForm';
import { IProjectPermitForm } from 'features/projects/components/ProjectPermitForm';
import { IProjectSpeciesForm } from 'features/projects/components/ProjectSpeciesForm';
import { Feature } from 'geojson';

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetProjectsListResponse
 */
export interface IGetProjectsListResponse {
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
 * Create project post object.
 *
 * @export
 * @interface ICreateProjectRequest
 */
export interface ICreateProjectRequest {
  coordinator: IProjectCoordinatorForm;
  permit: IProjectPermitForm;
  project: IProjectDetailsForm;
  objectives: IProjectObjectivesForm;
  species: IProjectSpeciesForm;
  location: IProjectLocationForm;
  iucn: IProjectIUCNForm;
  funding: IProjectFundingForm;
  partnerships: IProjectPartnershipsForm;
}

/**
 * Create project response object.
 *
 * @export
 * @interface ICreateProjectResponse
 */
export interface ICreateProjectResponse {
  id: number;
}

/**
 * Create project post body when no sampling was conducted.
 *
 * @export
 * @interface ICreatePermitNoSamplingRequest
 */
export interface ICreatePermitNoSamplingRequest {
  permit: IProjectPermitForm;
  coordinator: IProjectCoordinatorForm;
}

/**
 * Create project response object in which no sampling was conducted.
 *
 * @export
 * @interface ICreatePermitNoSamplingResponse
 */
export interface ICreatePermitNoSamplingResponse {
  ids: number[];
}

export enum UPDATE_GET_ENTITIES {
  coordinator = 'coordinator',
  permit = 'permit',
  project = 'project',
  objectives = 'objectives',
  location = 'location',
  species = 'species',
  iucn = 'iucn',
  funding = 'funding',
  partnerships = 'partnerships'
}

/**
 * An interface for a single instance of project metadata, for update-only use cases.
 *
 * @export
 * @interface IGetProjectForUpdateResponse
 */
export interface IGetProjectForUpdateResponse {
  id: number;
  project: IGetProjectForUpdateResponseDetails | null;
  objectives: IGetProjectForUpdateResponseObjectives | null;
  location: IGetProjectForUpdateResponseLocation | null;
  coordinator: IGetProjectForUpdateResponseCoordinator | null;
  species: IGetProjectForUpdateResponseSpecies | null;
  iucn: IGetProjectForUpdateResponseIUCN | null;
  funding: IGetProjectForUpdateResponseFundingSource | null;
  partnerships: IGetProjectForUpdateResponsePartnerships | null;
}

export interface IGetProjectForUpdateResponseDetails {
  project_name: string;
  project_type: number;
  project_type_name?: string;
  project_activities: number[];
  climate_change_initiatives: number[];
  start_date: string;
  end_date: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseObjectives {
  objectives: string;
  caveats: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseLocation {
  regions: string[];
  location_description: string;
  geometry: Feature[];
  revision_count: number;
}

export interface IGetProjectForUpdateResponseCoordinator {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseSpecies {
  focal_species: string[];
  ancillary_species: string[];
}

interface IGetProjectForUpdateResponseIUCNArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IGetProjectForUpdateResponseIUCN {
  classificationDetails: IGetProjectForUpdateResponseIUCNArrayItem[];
}

interface IGetProjectForUpdateResponseFundingSourceArrayItem {
  agency_id: number;
  investment_action_category: number;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
}

export interface IGetProjectForUpdateResponseFundingSource {
  fundingAgencies: IGetProjectForUpdateResponseFundingSourceArrayItem[];
}

export interface IGetProjectForUpdateResponsePartnerships {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

/**
 * An interface for a single instance of project metadata, for view-only use cases.
 *
 * @export
 * @interface IGetProjectForViewResponse
 */
export interface IGetProjectForViewResponse {
  id: number;
  project: IGetProjectForViewResponseDetails;
  objectives: IGetProjectForViewResponseObjectives;
  location: IGetProjectForViewResponseLocation;
  coordinator: IGetProjectForViewResponseCoordinator;
  species: IGetProjectForViewResponseSpecies;
  iucn: IGetProjectForViewResponseIUCN;
  funding: IGetProjectForViewResponseFundingSource;
  partnerships: IGetProjectForViewResponsePartnerships;
}

export interface IGetProjectForViewResponseDetails {
  project_name: string;
  project_type: string;
  project_type_name?: string;
  project_activities: number[];
  climate_change_initiatives: number[];
  start_date: string;
  end_date: string;
}

export interface IGetProjectForViewResponseObjectives {
  objectives: string;
  caveats: string;
}

export interface IGetProjectForViewResponseLocation {
  regions: string[];
  location_description: string;
  geometry: Feature[];
}

export interface IGetProjectForViewResponseCoordinator {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
}

interface IGetProjectForViewResponseIUCNArrayItem {
  classification: string;
  subClassification1: string;
  subClassification2: string;
}

export interface IGetProjectForViewResponseIUCN {
  classificationDetails: IGetProjectForViewResponseIUCNArrayItem[];
}

interface IGetProjectForViewResponseFundingSourceArrayItem {
  agency_id: string;
  agency_name: string;
  investment_action_category: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
}

export interface IGetProjectForViewResponseFundingSource {
  fundingAgencies: IGetProjectForViewResponseFundingSourceArrayItem[];
}

export interface IGetProjectForViewResponseSpecies {
  id: number;
  focal_species: string[];
  ancillary_species: string[];
}

export interface IGetProjectForViewResponsePartnerships {
  indigenous_partnerships: string[];
  stakeholder_partnerships: string[];
}

/**
 * A single media item.
 *
 * @export
 * @interface IGetProjectMediaListResponse
 */
export interface IGetProjectMediaListResponse {
  file_name: string;
  encoded_file: string;
}
