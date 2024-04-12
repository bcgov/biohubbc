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

/**
 * Local getter for retrieving the ClamAV client.
 *
 * @returns {*} {clamd.ClamScanner | null} The ClamAV Scanner if `process.env.ENABLE_FILE_VIRUS_SCAN` is set to
 * 'true' and other appropriate environment variables are set; `null` otherwise.
 */
export const _getClamAvScanner = (): clamd.ClamScanner | null => {
  if (process.env.ENABLE_FILE_VIRUS_SCAN === 'true' && process.env.CLAMAV_HOST && process.env.CLAMAV_PORT) {
    return clamd.createScanner(process.env.CLAMAV_HOST, Number(process.env.CLAMAV_PORT));
  }

  return null;
};

/**
 * Local getter for retrieving the S3 client.
 *
 * @returns {*} {AWS.S3} The S3 client
 */
export const _getS3Client = (): AWS.S3 => {
  const awsEndpoint = new AWS.Endpoint(_getObjectStoreUrl());

  return new AWS.S3({
    endpoint: awsEndpoint.href,
    accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID,
    secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY_ID,
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    region: 'ca-central-1'
  });
};

/**
 * Local getter for retrieving the S3 object store URL.
 *
 * @returns {*} {string} The object store URL
 */
export const _getObjectStoreUrl = (): string => {
  return process.env.OBJECT_STORE_URL || 'nrs.objectstore.gov.bc.ca';
};

/**
 * Local getter for retrieving the S3 object store bucket name.
 *
 * @returns {*} {string} The object store bucket name
 */
export const _getObjectStoreBucketName = (): string => {
  return process.env.OBJECT_STORE_BUCKET_NAME || '';
};

/**
 * Returns the S3 host URL. It optionally takes an S3 key as a parameter, which produces
 * a full URL to the given file in S3.
 *
 * @export
 * @param {string} [key] The key to an object in S3
 * @returns {*} {string} The s3 host URL
 */
export const getS3HostUrl = (key?: string): string => {
  // Appends the given S3 object key, trimming between 0 and 2 trailing '/' characters
  return `${_getObjectStoreUrl()}/${_getObjectStoreBucketName()}/${key || ''}`.replace(/\/{0,2}$/, '');
};

/**
 * Local getter for retrieving the S3 key prefix.
 *
 * @returns {*} {string} The S3 key prefix
 */
export const _getS3KeyPrefix = (): string => {
  return process.env.S3_KEY_PREFIX || 'sims';
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
  const s3Client = _getS3Client();
  if (!key || !s3Client) {
    return null;
  }

  return s3Client.deleteObject({ Bucket: _getObjectStoreBucketName(), Key: key }).promise();
}

/**
 * Upload a file to S3.
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
  const s3Client = _getS3Client();

  return s3Client
    .upload({
      Bucket: _getObjectStoreBucketName(),
      Body: file.buffer,
      ContentType: file.mimetype,
      Key: key,
      Metadata: metadata
    })
    .promise();
}

export async function uploadBufferToS3(
  buffer: Buffer,
  mimetype: string,
  key: string,
  metadata: Metadata = {}
): Promise<ManagedUpload.SendData> {
  const s3Client = _getS3Client();

  return s3Client
    .upload({
      Bucket: _getObjectStoreBucketName(),
      Body: buffer,
      ContentType: mimetype,
      Key: key,
      Metadata: metadata
    })
    .promise();
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
  const s3Client = _getS3Client();

  return s3Client
    .getObject({
      Bucket: _getObjectStoreBucketName(),
      Key: key,
      VersionId: versionId
    })
    .promise();
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
  const s3Client = _getS3Client();

  return s3Client.listObjects({ Bucket: _getObjectStoreBucketName(), Prefix: path }).promise();
};

/**
 * Retrieves all metadata for the given S3 object, including custom HTTP headers.
 *
 * @export
 * @param {string} key the key of the object
 * @returns {*} {Promise<HeadObjectOutput}
 */
export async function getObjectMeta(key: string): Promise<HeadObjectOutput> {
  const s3Client = _getS3Client();

  return s3Client.headObject({ Bucket: _getObjectStoreBucketName(), Key: key }).promise();
}

/**
 * Get an s3 signed url.
 *
 * @param {string} key S3 object key
 * @return {*}  {(Promise<string | null>)} the response from S3 or null if required parameters are null
 */
export async function getS3SignedURL(key: string): Promise<string | null> {
  const s3Client = _getS3Client();

  if (!key || !s3Client) {
    return null;
  }

  return s3Client.getSignedUrl('getObject', {
    Bucket: _getObjectStoreBucketName(),
    Key: key,
    Expires: 300000 // 5 minutes
  });
}

export interface IS3FileKey {
  projectId: number;
  surveyId?: number;
  submissionId?: number;
  folder?: string;
  fileName: string;
}

export function generateS3FileKey(options: IS3FileKey): string {
  const keyParts: (string | number)[] = [_getS3KeyPrefix()];

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

  if (options.folder) {
    keyParts.push(options.folder);
  }

  if (options.fileName) {
    keyParts.push(options.fileName);
  }

  return keyParts.filter(Boolean).join('/');
}

export async function scanFileForVirus(file: Express.Multer.File): Promise<boolean> {
  const ClamAVScanner = _getClamAvScanner();

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
