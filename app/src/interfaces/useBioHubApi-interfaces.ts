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
 * Create project post body when no sampling was conducted.
 *
 * @export
 * @interface IPermitNoSamplingPostObject
 */
export interface IPermitNoSamplingPostObject {
  permit: IProjectPermitForm;
  coordinator: IProjectCoordinatorForm;
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
 * Create project response object in which no sampling was conducted.
 *
 * @export
 * @interface ICreatePermitNoSamplingResponse
 */
export interface ICreatePermitNoSamplingResponse {
  ids: number[];
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

export interface ICode {
  id: number;
  name: string;
}

export type ICodeSet<T extends ICode = ICode> = T[];

/**
 * Get all codes response object.
 *
 * @export
 * @interface IGetAllCodesResponse
 */
export interface IGetAllCodesResponse {
  coordinator_agency: ICodeSet;
  management_action_type: ICodeSet;
  climate_change_initiative: ICodeSet;
  first_nations: ICodeSet;
  funding_source: ICodeSet;
  investment_action_category: ICodeSet<{ id: number; fs_id: number; name: string }>;
  activity: ICodeSet;
  project_type: ICodeSet;
  region: ICodeSet;
  species: ICodeSet;
  iucn_conservation_action_level_1_classification: ICodeSet;
  iucn_conservation_action_level_2_subclassification: ICodeSet<{ id: number; iucn1_id: number; name: string }>;
  iucn_conservation_action_level_3_subclassification: ICodeSet<{ id: number; iucn2_id: number; name: string }>;
}
