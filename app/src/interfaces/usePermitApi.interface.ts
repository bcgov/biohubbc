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

/**
 * Create permits response object.
 *
 * @export
 * @interface ICreatePermitsResponse
 */
export interface ICreatePermitsResponse {
  id: number;
}
