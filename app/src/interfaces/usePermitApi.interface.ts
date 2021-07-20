import { IPermitsArrayItem } from 'features/permits/CreatePermitPage';
import { IProjectCoordinatorForm } from 'features/projects/components/ProjectCoordinatorForm';

/**
 * Permit response object.
 *
 * @export
 * @interface IGetPermitsListResponse
 */
export interface IGetPermitsListResponse {
  id: number;
  number: string;
  type: string;
  coordinator_agency: string;
  project_name: string;
}

export interface IGetNonSamplingPermit {
  permit_id: number;
  number: string;
  type: string;
}

/**
 * Create permits request object.
 *
 * @export
 * @interface ICreatePermitsRequest
 */
export interface ICreatePermitsRequest {
  coordinator: IProjectCoordinatorForm;
  permit: {
    permits: IPermitsArrayItem[];
  };
}

/**
 * Create permits response object.
 *
 * @export
 * @interface ICreatePermitsResponse
 */
export interface ICreatePermitsResponse {
  id: number;
}
