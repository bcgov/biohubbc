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
