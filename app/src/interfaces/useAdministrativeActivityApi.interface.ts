/**
 * Create/Update draft response object.
 *
 * @export
 * @interface IAccessRequestResponse
 */
export interface IAccessRequestResponse {
  id: number;
  date: string;
}

/**
 * `Has Pending Access Request` response object.
 *
 * @export
 * @interface IHasPendingAccessRequestResponse
 */
 export interface IHasPendingAccessRequestResponse {
  hasPending: string;
}
