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

export interface IGetProjectSurvey {
  id: number;
  name: string;
  species: string;
  start_date: string;
  end_date: string;
  status_name: string;
}

export interface IGetProjectAttachment {
  id: number;
  fileName: string;
  lastModified: string;
  size: number;
}

/**
 * Get project attachments response object.
 *
 * @export
 * @interface IGetProjectAttachmentsResponse
 */
export interface IGetProjectAttachmentsResponse {
  attachmentsList: IGetProjectAttachment[];
}

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetProjectsListResponse
 */
export interface IGetProjectsListResponse {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  coordinator_agency: string;
  project_type: string;
  permits_list: string;
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
  project?: IGetProjectForUpdateResponseDetails;
  permit?: IGetProjectForUpdateResponsePermit;
  objectives?: IGetProjectForUpdateResponseObjectives;
  location?: IGetProjectForUpdateResponseLocation;
  coordinator?: IGetProjectForUpdateResponseCoordinator;
  species?: IGetProjectForUpdateResponseSpecies;
  iucn?: IGetProjectForUpdateResponseIUCN;
  funding?: IGetProjectForUpdateResponseFundingData;
  partnerships?: IGetProjectForUpdateResponsePartnerships;
}

export interface IGetProjectForUpdateResponseDetails {
  project_name: string;
  project_type: number;
  project_activities: number[];
  start_date: string;
  end_date: string;
  revision_count: number;
}

interface IGetProjectForUpdateResponsePermitArrayItem {
  permit_number: string;
  permit_type: string;
  sampling_conducted: string;
}

export interface IGetProjectForUpdateResponsePermit {
  permits: IGetProjectForUpdateResponsePermitArrayItem[];
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

interface IGetProjectForUpdateResponseFundingSource {
  id: number;
  agency_id: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseFundingData {
  fundingSources: IGetProjectForUpdateResponseFundingSource[];
}

export interface IGetProjectForUpdateResponsePartnerships {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

/**
 * An interface for a single instance of project metadata, for update-only use cases.
 *
 * @export
 * @interface IUpdateProjectRequest
 * @extends {IGetProjectForUpdateResponse}
 */
export interface IUpdateProjectRequest extends IGetProjectForUpdateResponse {}

/**
 * An interface for a single instance of project metadata, for view-only use cases.
 *
 * @export
 * @interface IGetProjectForViewResponse
 */
export interface IGetProjectForViewResponse {
  id: number;
  project: IGetProjectForViewResponseDetails;
  permit: IGetProjectForViewResponsePermit;
  objectives: IGetProjectForViewResponseObjectives;
  location: IGetProjectForViewResponseLocation;
  coordinator: IGetProjectForViewResponseCoordinator;
  species: IGetProjectForViewResponseSpecies;
  iucn: IGetProjectForViewResponseIUCN;
  funding: IGetProjectForViewResponseFundingData;
  partnerships: IGetProjectForViewResponsePartnerships;
}

export interface IGetProjectForViewResponseDetails {
  project_name: string;
  project_type: string;
  project_activities: number[];
  start_date: string;
  end_date: string;
}

interface IGetProjectForViewResponsePermitArrayItem {
  permit_number: string;
  permit_type: string;
  sampling_conducted: boolean;
}

export interface IGetProjectForViewResponsePermit {
  permits: IGetProjectForViewResponsePermitArrayItem[];
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

interface IGetProjectForViewResponseFundingSource {
  id: number;
  agency_id: number;
  agency_name: string;
  investment_action_category: number;
  investment_action_category_name: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  agency_project_id: string;
  revision_count: number;
}

export interface IGetProjectForViewResponseFundingData {
  fundingSources: IGetProjectForViewResponseFundingSource[];
}

export interface IGetProjectForViewResponseSpecies {
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

/**
 * Create project survey post object.
 *
 * @export
 * @interface ICreateProjectSurveyRequest
 */
export interface ICreateProjectSurveyRequest {
  biologist_first_name: string;
  biologist_last_name: string;
  category_rational: string;
  data_sharing_agreement_required: string;
  end_date: string;
  foippa_requirements_accepted: boolean;
  management_unit: string;
  park: string;
  proprietary_data_category: string;
  proprietor_name: string;
  sedis_procedures_accepted: boolean;
  species: string;
  start_date: string;
  survey_area_name: string;
  survey_data_proprietary: string;
  survey_name: string;
  survey_purpose: string;
}

/**
 * Create project survey response object.
 *
 * @export
 * @interface ICreateProjectSurveyResponse
 */
export interface ICreateProjectSurveyResponse {
  id: number;
}
