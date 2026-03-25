export interface IBioHubSubmissionHistoryRow {
  submissionUploadId: string;
  status: string;
  createDate: string;
}

export interface IBioHubWrappedSubmissionHistoryResponse {
  submissionId: number;
  history: IBioHubSubmissionHistoryRow[];
}

export interface ISubmissionHistoryRow {
  submissionUploadId: string;
  status: string;
  createDate: string;
  submissionId?: number;
}

/**
 * Interface for multipart upload result
 */
export interface UploadResult {
  /** The part number in the multipart upload sequence */
  PartNumber: number;
  /** The ETag returned by the server for this part */
  ETag: string;
}
