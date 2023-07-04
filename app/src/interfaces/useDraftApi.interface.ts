import { ICreateProjectRequest } from './useProjectApi.interface';

/**
 * Create/Update draft response object.
 *
 * @export
 * @interface IDraftResponse
 */
export interface IDraftResponse {
  webform_draft_id: number;
  create_date: string;
  update_date: string;
}

/**
 * Get drafts list response object.
 *
 * @export
 * @interface IGetDraftsListResponse
 */
export interface IGetDraftsListResponse {
  webform_draft_id: number;
  name: string;
}

/**
 * Get single draft response object.
 *
 * @export
 * @interface IGetDraftResponse
 */
export interface IGetDraftResponse {
  id: number;
  name: string;
  data: ICreateProjectRequest;
}
