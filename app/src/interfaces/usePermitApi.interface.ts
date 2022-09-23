/**
 * Permit response object.
 *
 * @export
 * @interface IGetPermitsListResponse
 */
export interface IGetPermitsListResponse {
  id: number | string;
  number: string;
  type: string;
  coordinator_agency: string;
  project_name: string;
}
