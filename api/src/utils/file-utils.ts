import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import NodeClam from 'clamscan';
import { Readable } from 'stream';
import { getLogger } from './logger';

const defaultLog = getLogger('/api/src/utils/file-utils');

/**
 * Local getter for retrieving the ClamAV client.
 *
 * @return {*}  {Promise<NodeClam>}
 */
export const _getClamAvScanner = async (): Promise<NodeClam> => {
  return new NodeClam().init({
    clamdscan: {
      host: process.env.CLAMAV_HOST,
      port: Number(process.env.CLAMAV_PORT)
    }
  });
};

/**
 * Local getter for retrieving the S3 client.
 *
 * @return {*}  {S3Client} The S3 client
 */
export const _getS3Client = (): S3Client => {
  return new S3Client({
    endpoint: _getObjectStoreUrl(),
    credentials: {
      accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY_ID!
    },
    forcePathStyle: true,
    region: 'ca-central-1'
  });
};

/**
 * Local getter for retrieving the S3 object store URL.
 *
 * @returns {*} {string} The object store URL
 */
export const _getObjectStoreUrl = (): string => {
  const url = process.env.OBJECT_STORE_URL || 'https://nrs.objectstore.gov.bc.ca';

  if (!['https://', 'http://'].some((protocol) => url.toLowerCase().startsWith(protocol))) {
    return `https://${url}`;
  }

  return url;
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
export const getS3KeyPrefix = (): string => {
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
 * @returns {Promise<DeleteObjectCommandOutput>} the response from S3 or null if required parameters are null
 */
export async function deleteFileFromS3(key: string): Promise<DeleteObjectCommandOutput | null> {
  const s3Client = _getS3Client();
  if (!key || !s3Client) {
    return null;
  }

  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: _getObjectStoreBucketName(),
      Key: key
    })
  );
}

/**
 * Bulk delete files from S3 from a list of keys.
 *
 * For potential future reference:
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/DeleteObjectsCommand/
 *
 * @export
 * @param {string} keys - List of S3 keys to delete
 * @returns {Promise<DeleteObjectCommandOutput>} the response from S3 or null if required parameters are null
 */
export async function bulkDeleteFilesFromS3(keys: string[]): Promise<DeleteObjectsCommandOutput | null> {
  const s3Client = _getS3Client();

  if (!keys.length || !s3Client) {
    return null;
  }

  return s3Client.send(
    new DeleteObjectsCommand({
      Bucket: _getObjectStoreBucketName(),
      Delete: {
        Objects: keys.map((key) => ({ Key: key }))
      }
    })
  );
}

/**
 * Upload a file to S3.
 *
 * @export
 * @param {Express.Multer.File} file an object containing information about a single piece of media
 * @param {string} key the path where S3 will store the file
 * @param {Record<string, string>} [metadata={}] A metadata object to store additional information with the file
 * @returns {Promise<PutObjectCommandOutput>} the response from S3
 */
export async function uploadFileToS3(
  file: Express.Multer.File,
  key: string,
  metadata: Record<string, string> = {}
): Promise<PutObjectCommandOutput> {
  const s3Client = _getS3Client();

  return s3Client.send(
    new PutObjectCommand({
      Bucket: _getObjectStoreBucketName(),
      Body: file.buffer,
      ContentType: file.mimetype,
      Key: key,
      Metadata: metadata
    })
  );
}

/**
 * Upload a buffer to S3.
 *
 * @export
 * @param {Buffer} buffer the buffer to upload
 * @param {string} mimetype the mimetype of the buffer
 * @param {string} key the path where S3 will store the file
 * @param {Record<string, string>} [metadata={}] A metadata object to store additional information with the file
 * @returns {Promise<PutObjectCommandOutput>} the response from S3
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  mimetype: string,
  key: string,
  metadata: Record<string, string> = {}
): Promise<PutObjectCommandOutput> {
  const s3Client = _getS3Client();

  return s3Client.send(
    new PutObjectCommand({
      Bucket: _getObjectStoreBucketName(),
      Body: buffer,
      ContentType: mimetype,
      Key: key,
      Metadata: metadata
    })
  );
}

/**
 * Upload a stream to S3.
 *
 * @export
 * @param {stream} Readable the stream to upload
 * @param {string} mimetype the mimetype of the stream data
 * @param {string} key the path where S3 will store the file
 * @param {Record<string, string>} [metadata={}] A metadata object to store additional information with the file
 * @return {*}  {Promise<CompleteMultipartUploadCommandOutput>} the response from S3
 */
export async function uploadStreamToS3(
  stream: Readable,
  mimetype: string,
  key: string,
  metadata: Record<string, string> = {}
): Promise<CompleteMultipartUploadCommandOutput> {
  const streamUpload = new Upload({
    client: _getS3Client(),
    params: {
      Bucket: _getObjectStoreBucketName(),
      Key: key,
      Body: stream,
      ContentType: mimetype,
      Metadata: metadata
    }
  });

  return streamUpload.done();
}

/**
 * Fetch a file from S3.
 *
 * @export
 * @param {string} key the S3 key of the file to fetch
 * @param {string} [versionId] the S3 version id  of the file to fetch (optional)
 * @return {Promise<GetObjectCommandOutput>}
 */
export async function getFileFromS3(key: string, versionId?: string): Promise<GetObjectCommandOutput> {
  const s3Client = _getS3Client();

  return s3Client.send(
    new GetObjectCommand({
      Bucket: _getObjectStoreBucketName(),
      Key: key,
      VersionId: versionId
    })
  );
}

/**
 * Fetches a list of files in S3 at the given path
 *
 * @export
 * @param {string} path the path (Prefix) of the directory in S3
 * @return {Promise<ListObjectsCommandOutput>} All objects at the given path, also including
 * the directory itself.
 */
export const listFilesFromS3 = async (path: string): Promise<ListObjectsCommandOutput> => {
  const s3Client = _getS3Client();

  return s3Client.send(
    new ListObjectsCommand({
      Bucket: _getObjectStoreBucketName(),
      Prefix: path
    })
  );
};

/**
 * Retrieves all metadata for the given S3 object, including custom HTTP headers.
 *
 * @export
 * @param {string} key the key of the object
 * @returns {Promise<HeadObjectCommandOutput}
 */
export async function getObjectMeta(key: string): Promise<HeadObjectCommandOutput> {
  const s3Client = _getS3Client();

  return s3Client.send(new HeadObjectCommand({ Bucket: _getObjectStoreBucketName(), Key: key }));
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

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: _getObjectStoreBucketName(),
      Key: key
    }),
    {
      expiresIn: 300000 // 5 minutes
    }
  );
}

/**
 * Get an array of s3 signed urls.
 *
 * @export
 * @param {string[]} keys
 * @return {*}  {(Promise<(string | null)[]>)}
 */
export async function getS3SignedURLs(keys: string[]): Promise<(string | null)[]> {
  return Promise.all(keys.map((key) => getS3SignedURL(key)));
}

export interface IS3FileKey {
  /**
   * The project ID the file is associated with.
   */
  projectId: number;
  /**
   * The survey ID the file is associated with.
   */
  surveyId?: number;
  /**
   * The template submission ID the file is associated with.
   *
   * @deprecated
   */
  submissionId?: number;
  /**
   * The sub-folder in the project/survey where the file is stored.
   *
   * Note: For regular/generic file attachments, leave this undefined.
   */
  folder?: 'reports' | 'telemetry-credentials' | 'captures' | 'motalities';
  /**
   * The name of the file.
   *
   * @type {string}
   * @memberof IS3FileKey
   */
  fileName: string;
}

/**
 * Generate an S3 key for a project or survey attachment file.
 *
 * @export
 * @param {IS3FileKey} options
 * @return {*}  {string}
 */
export function generateS3FileKey(options: IS3FileKey): string {
  const keyParts: (string | number)[] = [getS3KeyPrefix()];

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

/**
 * Generate an S3 key for a data export zip file.
 *
 * @export
 * @return {*}  {string}
 */
export function generateS3ExportKey(): string {
  const keyParts: (string | number)[] = [getS3KeyPrefix()];

  keyParts.push('exports');
  keyParts.push(`sims_data_export_${new Date().toISOString()}.zip`);

  return keyParts.join('/');
}

/**
 * Execute a clamav virus scan against the given file.
 *
 * Note: This depends on the external clamav service being available and configured correctly.
 *
 * @export
 * @param {Express.Multer.File} file
 * @return {*}  {Promise<boolean>} `true` if the file is safe, `false` if the file is a virus or contains malicious
 * content.
 */
export async function scanFileForVirus(file: Express.Multer.File): Promise<boolean> {
  if (process.env.ENABLE_FILE_VIRUS_SCAN !== 'true' || !process.env.CLAMAV_HOST || !process.env.CLAMAV_PORT) {
    // Virus scanning is not enabled or necessary environment variables are not set
    return true;
  }

  const ClamAVScanner = await _getClamAvScanner();

  // if virus scan is not to be performed/cannot be performed
  if (!ClamAVScanner) {
    return true;
  }

  const fileStream = Readable.from(file.buffer);

  const clamavScanResult = await ClamAVScanner.scanStream(fileStream);

  // if virus found in file
  if (clamavScanResult.isInfected) {
    defaultLog.warn({
      label: 'scanFileForVirus',
      message: 'Malicious content detected',
      file: file.originalname,
      clamavScanResult
    });

    return false;
  }

  // no virus found in file
  return true;
}
