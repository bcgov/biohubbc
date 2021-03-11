import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';
import { IProjectDetailsForm } from 'features/projects/components/ProjectDetailsForm';
import { IProjectFundingForm } from 'features/projects/components/ProjectFundingForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectObjectivesForm } from 'features/projects/components/ProjectObjectivesForm';
import { IProjectPermitForm } from 'features/projects/components/ProjectPermitForm';
import { IProjectSpeciesForm } from 'features/projects/components/ProjectSpeciesForm';

/**
 * The parent type that an object must conform to, at a minimum, to be rendered via the FormContainer.tsx
 *
 * @export
 * @interface IFormRecord
 */
export interface IFormRecord {
  id?: any;
  form_data?: any;
}

/**
 * Create new activity endpoint object.
 *
 * @export
 * @interface IActivity
 */
export interface ICreateActivity {
  tags: string[];
  id: number;
  form_data: any;
}

/**
 * Activity object.
 *
 * @export
 * @interface IActivity
 * @extends {IFormRecord}
 */
export interface IActivity extends IFormRecord {
  id: number;
  tags: string[];
  form_data: any;
}

/**
 * Create new template endpoint object.
 *
 * @export
 * @interface ITemplate
 */
export interface ICreateTemplate {
  name: string;
  description: string;
  tags: string[];
  data_template: any;
  ui_template: any;
}

/**
 * Template object.
 *
 * @export
 * @interface ITemplate
 */
export interface ITemplate {
  id: number;
  name: string;
  description: string;
  tags: string[];
  data_template: any;
  ui_template: any;
}

/**
 * Create project post body.
 *
 * @export
 * @interface IProjectPostObject
 */
export interface IProjectPostObject {
  coordinator: IProjectCoordinatorForm;
  permit: IProjectPermitForm;
  project: IProjectDetailsForm;
  objectives: IProjectObjectivesForm;
  species: IProjectSpeciesForm;
  location: IProjectLocationForm;
  iucn: IProjectIUCNForm;
  funding: IProjectFundingForm;
}

/**
 * Create partial-project post body.
 *
 * @export
 * @interface IPartialProjectPostObject
 */
export interface IPartialProjectPostObject {
  coordinator: IProjectCoordinatorForm;
  permit: IProjectPermitForm;
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
 * Create partial-project response object.
 *
 * @export
 * @interface ICreatePartialProjectResponse
 */
export interface ICreatePartialProjectResponse {
  id: number;
}

/**
 * Media object.
 *
 * @export
 * @interface IMedia
 */
export interface IMedia {
  media_date?: string;
  description?: string;
  file_name: string;
  encoded_file: string;
}

/**
 * Upload project artifacts response object.
 */
export interface IUploadProjectArtifactsResponse {
  Key: string;
}

/**
 * Get all codes response object.
 *
 * @export
 * @interface IGetAllCodesResponse
 */
export interface IGetAllCodesResponse {
  coordinator_agency: { id: number; name: string }[];
  management_action_type: { id: number; name: string }[];
  climate_change_initiative: { id: number; name: string }[];
  first_nations: { id: number; name: string }[];
  funding_source: { id: number; name: string }[];
  investment_action_category: { id: number; fs_id: number; name: string }[];
  project_activity: { id: number; name: string }[];
  project_type: { id: number; name: string }[];
  region: { id: number; name: string }[];
  species: { id: number; name: string }[];
}
