import type { BioHubIdentitySource } from '../constants/database';

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

export interface SubmissionSubmitter {
  guid: string;
  identifier: string;
  identitySource: BioHubIdentitySource;
}

export interface CreateSubmissionRequest {
  bytes: number;
  name: string;
  description: string;
  comment: string;
  submitters?: SubmissionSubmitter[];
  blueprint_id?: number;
}

export interface CreateExistingSubmissionUploadRequest {
  bytes: number;
  name?: string;
  description?: string;
  comment?: string;
  submitters?: SubmissionSubmitter[];
  blueprint_id?: number;
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

export interface SubmissionUploadInitiateResponse {
  submissionUuid: string;
  submissionUploadId: string;
  uploadId: string;
  s3UploadId: string;
  uploadArchiveId: string;
  key: string;
  partCount: number;
  presignedUrls: UploadPart[];
}

export interface UploadResult {
  PartNumber: number;
  ETag: string;
}

export interface UploadTarFilePartsOptions {
  concurrencyLimit?: number;
}
