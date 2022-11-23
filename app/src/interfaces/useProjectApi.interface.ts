import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectFundingForm } from 'features/projects/components/ProjectFundingForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectPartnershipsForm } from 'features/projects/components/ProjectPartnershipsForm';
import { Feature } from 'geojson';

export type AttachmentStatus = 'PENDING_REVIEW' | 'SECURED' | 'UNSECURED' | 'SUBMITTED';

/**
 * @TODO securityRuleCount and status should likely be required, not optional.
 */
export interface IGetProjectAttachment {
  id: number;
  fileName: string;
  fileType: string;
  lastModified: string;
  size: number;
  securityToken: string;
  securityReviewTimestamp: string;
  revisionCount: number;
  securityRuleCount?: number;
  status?: AttachmentStatus;
}

export type IGetProjectReportAttachment = IGetProjectAttachment & { fileType: 'Report' };

/**
 * An interface for an instance of filter fields for project advanced filter search
 */
export interface IProjectAdvancedFilterRequest {
  coordinator_agency: string;
  project_type: string;
  start_date: string;
  end_date: string;
  keyword: string;
  project_name: string;
  agency_id: number;
  agency_project_id: string;
  species: number[];
}

/**
 * Get project attachments response object.
 *
 * @export
 * @interface IGetProjectAttachmentsResponse
 */
export interface IGetProjectAttachmentsResponse {
  attachmentsList: IGetProjectAttachment[];
  reportAttachmentsList: IGetProjectReportAttachment[];
}

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetUserProjectsListResponse
 */
export interface IGetUserProjectsListResponse {
  project_id: number;
  name: string;
  system_user_id: number;
  project_role_id: number;
  project_participation_id: number;
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
  completion_status: string;
}

/**
 * Create project post object.
 *
 * @export
 * @interface ICreateProjectRequest
 */
export interface ICreateProjectRequest
  extends IProjectCoordinatorForm,
    IProjectDetailsForm,
    IProjectObjectivesForm,
    IProjectLocationForm,
    IProjectIUCNForm,
    IProjectFundingForm,
    IProjectPartnershipsForm {}

/**
 * Create project response object.
 *
 * @export
 * @interface ICreateProjectResponse
 */
export interface ICreateProjectResponse {
  id: number;
}

export enum UPDATE_GET_ENTITIES {
  coordinator = 'coordinator',
  project = 'project',
  objectives = 'objectives',
  location = 'location',
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
  objectives?: IGetProjectForUpdateResponseObjectives;
  location?: IGetProjectForUpdateResponseLocation;
  coordinator?: IGetProjectForUpdateResponseCoordinator;
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
export interface IGetProjectForUpdateResponseObjectives {
  objectives: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseLocation {
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

interface IGetProjectForUpdateResponseIUCNArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IGetProjectForUpdateResponseIUCN {
  classificationDetails: IGetProjectForUpdateResponseIUCNArrayItem[];
}

export interface IGetProjectForUpdateResponseFundingSource {
  id: number;
  agency_id: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_project_id: string | null;
  funding_amount: number;
  start_date: string;
  end_date: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseFundingData {
  funding_sources: IGetProjectForUpdateResponseFundingSource[];
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
export type IUpdateProjectRequest = IGetProjectForUpdateResponse;

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
  iucn: IGetProjectForViewResponseIUCN;
  funding: IGetProjectForViewResponseFundingData;
  partnerships: IGetProjectForViewResponsePartnerships;
}

export interface IGetProjectForViewResponseDetails {
  project_name: string;
  project_type: number;
  project_activities: number[];
  start_date: string;
  end_date: string;
  completion_status: string;
}
export interface IGetProjectForViewResponseObjectives {
  objectives: string;
}

export interface IGetProjectForViewResponseLocation {
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
  classification: number;
  subClassification1: number;
  subClassification2: number;
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

export interface IGetProjectForViewResponsePartnerships {
  indigenous_partnerships: number[];
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
 * A  file upload response.
 *
 * @export
 * @interface IUploadAttachmentResponse
 */
export interface IUploadAttachmentResponse {
  attachmentId: number;
  revision_count: number;
}

export interface IGetReportDetails {
  metadata: IGetReportMetadata | null;
  authors: IGetReportAuthors[];
  security_reasons: IGetSecurityReasons[];
}

export interface IGetReportMetadata {
  attachment_id: number;
  title: string;
  year_published: number;
  description: string;
  last_modified: string;
  revision_count: number;
}

export interface IGetReportAuthors {
  first_name: string;
  last_name: string;
}

export interface IGetSecurityReasons {
  security_reason_id: number;
  category: string;
  sub_category: string;
  reason: string;
  reason_description: string;
  date_expired: string;
}

export interface IGetProjectParticipantsResponseArrayItem {
  project_participation_id: number;
  project_id: number;
  system_user_id: number;
  project_role_id: number;
  project_role_name: string;
  user_identifier: string;
  user_identity_source_id: number;
}
export interface IGetProjectParticipantsResponse {
  participants: IGetProjectParticipantsResponseArrayItem[];
}

export interface IAddProjectParticipant {
  userIdentifier: string;
  identitySource: string;
  roleId: number;
}
