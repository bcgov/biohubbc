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
  surveySummaryData: ISurveySummaryData;
  surveySummarySupplementaryData: ISurveySummarySupplementaryData | null;
}

export interface ISurveySummaryData {
  survey_summary_submission_id: number;
  fileName: string;
  messages: IGetSummarySubmissionResponseMessages[];
}

export interface ISurveySummarySupplementaryData {
  survey_summary_submission_publish_id: number;
  survey_summary_submission_id: number;
  event_timestamp: string;
  artifact_revision_id: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}
export interface IUploadSummaryResultsResponse {
  summaryResultsId: number;
}
