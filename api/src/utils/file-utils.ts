import AWS from 'aws-sdk';
import {
  DeleteObjectOutput,
  GetObjectOutput,
  HeadObjectOutput,
  ListObjectsOutput,
  ManagedUpload,
  Metadata
} from 'aws-sdk/clients/s3';
import clamd from 'clamdjs';
import { S3_ROLE } from '../constants/roles';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { SubmissionErrorFromMessageType } from './submission-error';

const ClamAVScanner =
  (process.env.ENABLE_FILE_VIRUS_SCAN === 'true' &&
    process.env.CLAMAV_HOST &&
    process.env.CLAMAV_PORT &&
    clamd.createScanner(process.env.CLAMAV_HOST, Number(process.env.CLAMAV_PORT))) ||
  null;

const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME || '';
const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL || 'nrs.objectstore.gov.bc.ca';
const AWS_ENDPOINT = new AWS.Endpoint(OBJECT_STORE_URL);
const S3 = new AWS.S3({
  endpoint: AWS_ENDPOINT.href,
  accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID,
  secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY_ID,
  signatureVersion: 'v4',
  s3ForcePathStyle: true,
  region: 'ca-central-1'
});

/**
 * Returns the S3 public host URL.
 *
 * @export
 * @returns {*} {string}
 */
export const getS3PublicHostUrl = () => {
  return `${OBJECT_STORE_URL}/${OBJECT_STORE_BUCKET_NAME}`;
};

/**
 * Delete a file from S3, based on its key.
 *
 * For potential future reference, for deleting the delete marker of a file in S3:
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/RemDelMarker.html
 *
 * @export
 * @param {string} key the unique key assigned to the file in S3 when it was originally uploaded
 * @returns {Promise<GetObjectOutput>} the response from S3 or null if required parameters are null
 */
export async function deleteFileFromS3(key: string): Promise<DeleteObjectOutput | null> {
  if (!key) {
    return null;
  }

  return S3.deleteObject({ Bucket: OBJECT_STORE_BUCKET_NAME, Key: key }).promise();
}

/**
 * Upload a file to S3.
 *
 * Note: Assigns the `authenticated-read` permission.
 *
 * @export
 * @param {Express.Multer.File} file an object containing information about a single piece of media
 * @param {string} key the path where S3 will store the file
 * @param {Metadata} [metadata={}] A metadata object to store additional information with the file
 * @returns {Promise<ManagedUpload.SendData>} the response from S3 or null if required parameters are null
 */
export async function uploadFileToS3(
  file: Express.Multer.File,
  key: string,
  metadata: Metadata = {}
): Promise<ManagedUpload.SendData> {
  return S3.upload({
    Bucket: OBJECT_STORE_BUCKET_NAME,
    Body: file.buffer,
    ContentType: file.mimetype,
    Key: key,
    ACL: S3_ROLE.AUTH_READ,
    Metadata: metadata
  }).promise();
}

export async function uploadBufferToS3(
  buffer: Buffer,
  mimetype: string,
  key: string,
  metadata: Metadata = {}
): Promise<ManagedUpload.SendData> {
  return S3.upload({
    Bucket: OBJECT_STORE_BUCKET_NAME,
    Body: buffer,
    ContentType: mimetype,
    Key: key,
    ACL: S3_ROLE.AUTH_READ,
    Metadata: metadata
  })
    .promise()
    .catch(() => {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPLOAD_FILE_TO_S3);
    });
}

/**
 * Fetch a file from S3.
 *
 * @export
 * @param {string} key the S3 key of the file to fetch
 * @param {string} [versionId] the S3 version id  of the file to fetch (optional)
 * @return {*}  {Promise<GetObjectOutput>}
 */
export async function getFileFromS3(key: string, versionId?: string): Promise<GetObjectOutput> {
  return S3.getObject({
    Bucket: OBJECT_STORE_BUCKET_NAME,
    Key: key,
    VersionId: versionId
  })
    .promise()
    .catch(() => {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_FILE_FROM_S3);
    });
}

/**
 * Fetchs a list of files in S3 at the given path
 *
 * @export
 * @param {string} path the path (Prefix) of the directory in S3
 * @return {*}  {Promise<ListObjectsOutput>} All objects at the given path, also including
 * the directory itself.
 */
export const listFilesFromS3 = async (path: string): Promise<ListObjectsOutput> => {
  return S3.listObjects({ Bucket: OBJECT_STORE_BUCKET_NAME, Prefix: path }).promise();
};

/**
 * Retrieves all metadata for the given S3 object, including custom HTTP headers.
 *
 * @export
 * @param {string} key the key of the object
 * @returns {*} {Promise<HeadObjectOutput}
 */
export async function getObjectMeta(key: string): Promise<HeadObjectOutput> {
  return S3.headObject({ Bucket: OBJECT_STORE_BUCKET_NAME, Key: key }).promise();
}

/**
 * Get an s3 signed url.
 *
 * @param {string} key S3 object key
 * @returns {Promise<string>} the response from S3 or null if required parameters are null
 */
export async function getS3SignedURL(key: string): Promise<string | null> {
  if (!key) {
    return null;
  }

  return S3.getSignedUrl('getObject', {
    Bucket: OBJECT_STORE_BUCKET_NAME,
    Key: key,
    Expires: 300000 // 5 minutes
  });
}

export interface IS3FileKey {
  projectId: number;
  surveyId?: number;
  submissionId?: number;
  summaryId?: number;
  folder?: string;
  fileName: string;
}

export function generateS3FileKey(options: IS3FileKey): string {
  const keyParts: (string | number)[] = [];

  if (options.projectId) {
    keyParts.push('projects');
    keyParts.push(options.projectId);
  }

  if (options.surveyId) {
    keyParts.push('surveys');
    keyParts.push(options.surveyId);
  }

  if (options.submissionId) {
    keyParts.push('submissions');
    keyParts.push(options.submissionId);
  }

  if (options.summaryId) {
    keyParts.push('summaryresults');
    keyParts.push(options.summaryId);
  }

  if (options.folder) {
    keyParts.push(options.folder);
  }

  if (options.fileName) {
    keyParts.push(options.fileName);
  }

  return keyParts.join('/');
}

export async function scanFileForVirus(file: Express.Multer.File): Promise<boolean> {
  // if virus scan is not to be performed/cannot be performed
  if (!ClamAVScanner) {
    return true;
  }

  const clamavScanResult = await ClamAVScanner.scanBuffer(file.buffer, 3000, 1024 * 1024);

  // if virus found in file
  if (clamavScanResult.includes('FOUND')) {
    return false;
  }

  // no virus found in file
  return true;
}
