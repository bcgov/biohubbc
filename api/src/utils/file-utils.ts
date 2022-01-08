import AWS from 'aws-sdk';
import { DeleteObjectOutput, GetObjectOutput, ManagedUpload, Metadata } from 'aws-sdk/clients/s3';
import { S3_ROLE } from '../constants/roles';
import clamd from 'clamdjs';

const scanner =
  process.env.ENABLE_FILE_VIRUS_SCAN === 'true'
    ? clamd.createScanner(process.env.CLAMAV_HOST || 'clamav', Number(process.env.CLAMAV_PORT) || 3310)
    : null;
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
  }).promise();
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
  }).promise();
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
  folder?: string;
  fileName: string;
}

export function generateS3FileKey(options: IS3FileKey): string {
  const keyParts: (string | number)[] = [];

  if (options.projectId) {
    keyParts.push('projects');
    keyParts.push(options.projectId);
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
  if (!scanner) {
    return true;
  }

  const clamavScanResult = await scanner.scanBuffer(file.buffer, 3000, 1024 * 1024);

  // if virus found in file
  if (clamavScanResult.includes('FOUND')) {
    return false;
  }

  // no virus found in file
  return true;
}
