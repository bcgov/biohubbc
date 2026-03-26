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

export interface UploadPart {
  partNumber: number;
  url: string;
  partSizeBytes: number;
}

export interface UploadPartByteRange extends UploadPart {
  start: number;
  end: number;
}

export interface SubmissionUploadInitiateResult {
  uploadId: string;
  s3UploadId: string;
  key: string;
  presignedUrls: UploadPart[];
  partCount: number;
  submissionId: string;
  submissionUploadId: string;
}

export interface SubmissionUploadInitiateResponse extends SubmissionUploadInitiateResult {
  uploadArchiveId: string;
}

export interface UploadTarFilePartsOptions {
  concurrencyLimit?: number;
}

/**
 * Interface for multipart upload result
 */
export interface UploadResult {
  PartNumber: number;
  ETag: string;
}
