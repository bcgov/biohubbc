/**
 * Create/Update draft response object.
 *
 * @export
 * @interface IDraftResponse
 */
export interface IDraftResponse {
  id: number;
  date: string;
}

/**
 * Get drafts list response object.
 *
 * @export
 * @interface IGetDraftsListResponse
 */
export interface IGetDraftsListResponse {
  id: number;
  name: string;
}
