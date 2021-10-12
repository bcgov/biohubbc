interface IGetSummarySubmissionResponseMessages {
  id: number;
  class: string;
  type: string;
  message: string;
}

/**
 * Get summary results response object.
 *
 * @export
 * @interface IGetSummaryResultsResponse
 */
export interface IGetSummaryResultsResponse {
  id: number;
  fileName: string;
  messages: IGetSummarySubmissionResponseMessages[];
}

export interface IUploadSummaryResultsResponse {
  summaryResultsId: number;
}
