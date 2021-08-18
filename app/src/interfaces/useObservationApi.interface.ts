export interface IGetSubmissionCSVForViewItem {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface IGetSubmissionCSVForViewResponse {
  data: IGetSubmissionCSVForViewItem[];
}

/**
 * Get observation submission response object.
 *
 * @export
 * @interface IGetObservationSubmissionResponse
 */
export interface IGetObservationSubmissionResponse {
  id: number;
  fileName: string;
  status: string;
  messages: string[];
}

export interface IGetObservationSubmissionErrorListResponse {
  id: number;
  type: string;
  status: string;
  message: string;
}
