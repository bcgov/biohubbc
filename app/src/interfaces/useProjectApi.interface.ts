import { PublishStatus } from 'constants/attachments';
import { PROJECT_PERMISSION, PROJECT_ROLE } from 'constants/roles';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetProjectAttachment {
  id: number;
  fileName: string;
  fileType: string;
  lastModified: string;
  size: number;
  revisionCount: number;
  supplementaryAttachmentData: IProjectSupplementaryAttachmentData | IProjectSupplementaryReportAttachmentData | null;
}

export type IGetProjectReportAttachment = IGetProjectAttachment & { fileType: 'Report' };

export interface IProjectSupplementaryAttachmentData {
  project_attachment_publish_id: number;
  project_attachment_id: number;
  event_timestamp: string;
  artifact_revision_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface IProjectSupplementaryReportAttachmentData {
  project_report_publish_id: number;
  project_report_attachment_id: number;
  event_timestamp: string;
  artifact_revision_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
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
  project_participation_id: number;
  project_id: number;
  project_name: string;
  system_user_id: number;
  project_role_ids: number[];
  project_role_names: string[];
  project_role_permissions: string[];
}

/**
 * An interface that describes project supplementary data
 * @export
 * @interface IProjectSupplementaryData
 */
export interface IProjectSupplementaryData {
  publishStatus: PublishStatus;
}

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetProjectsListResponse
 */
export interface IGetProjectsListResponse {
  projects: IProjectsListItemData[];
  pagination: ApiPaginationResponseParams;
}

export interface IProjectsListItemData {
  project_id: number;
  name: string;
  start_date: string;
  end_date?: string;
  completion_status: string;
  regions: string[];
  project_programs: number[];
}

export interface IProjectUserRoles {
  participants: IGetProjectParticipant[];
}

/**
 * Create project post object.
 *
 * @export
 * @interface ICreateProjectRequest
 */
export type ICreateProjectRequest = IProjectDetailsForm & IProjectObjectivesForm & IProjectIUCNForm & IProjectUserRoles;

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
  project = 'project',
  objectives = 'objectives',
  location = 'location',
  iucn = 'iucn',
  participants = 'participants'
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
  iucn?: IGetProjectForUpdateResponseIUCN;
  participants?: IGetProjectParticipant[];
}

export interface IGetProjectForUpdateResponseDetails {
  project_name: string;
  project_programs: number[];
  start_date: string;
  end_date: string;
  revision_count: number;
}
export interface IGetProjectForUpdateResponseObjectives {
  objectives: string;
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
  projectData: ProjectViewObject;
  projectSupplementaryData: ProjectSupplementaryData;
}

/**
 * An interface for a single instance of project metadata, for view-only use cases.
 *
 * @export
 * @interface ProjectViewObject
 */
export interface ProjectViewObject {
  project: IGetProjectForViewResponseDetails;
  objectives: IGetProjectForViewResponseObjectives;
  participants: IGetProjectParticipant[];
  iucn: IGetProjectForViewResponseIUCN;
}

export interface IGetProjectForViewResponseDetails {
  project_id: number;
  project_name: string;
  project_programs: number[];
  start_date: string;
  end_date: string;
  completion_status: string;
}
export interface IGetProjectForViewResponseObjectives {
  objectives: string;
}

export interface IGetProjectParticipant {
  project_participation_id: number;
  project_id: number;
  system_user_id: number;
  identity_source: string;
  user_identifier: string;
  email: string | null;
  display_name: string;
  agency: string | null;
  project_role_ids: number[];
  project_role_names: string[];
  project_role_permissions: string[];
}

interface IGetProjectForViewResponseIUCNArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IGetProjectForViewResponseIUCN {
  classificationDetails: IGetProjectForViewResponseIUCNArrayItem[];
}

export interface ProjectSupplementaryData {
  project_metadata_publish: {
    project_metadata_publish_id: number;
    project_id: number;
    event_timestamp: string;
    submission_uuid: string;
    create_date: string;
    create_user: number;
    update_date: string | null;
    update_user: number | null;
    revision_count: number;
  } | null;
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
}

export interface IGetAttachmentDetails {
  metadata: { last_modified: string };
  authors: IGetReportAuthors[];
}

export interface IGetReportMetadata {
  project_report_attachment_id?: number;
  survey_report_attachment_id?: number;
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

export interface IAddProjectParticipant {
  userIdentifier: string;
  displayName: string;
  email: string;
  identitySource: string;
  roleId: number;
}

export type IGetUserProjectParticipantResponse = {
  project_id: number;
  system_user_id: number;
  project_role_ids: number[];
  project_role_names: PROJECT_ROLE[];
  project_role_permissions: PROJECT_PERMISSION[];
} | null;
