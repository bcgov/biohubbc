import AWS from 'aws-sdk';
import { GetObjectOutput, ManagedUpload, Metadata, ListObjectsOutput } from 'aws-sdk/clients/s3';
import { S3_ROLE } from '../constants/roles';
import { MediaBase64 } from '../models/media';
import { getLogger } from './logger';

const defaultLog = getLogger('file_utils.ts');
const projectId = '3';

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
 * Fetch a file from S3, based on its key.
 *
 * @export
 * @param {string} key the unique key assigned to the file in S3 when it was originally uploaded
 * @returns {Promise<GetObjectOutput>} the response from S3 or null if required parameters are null
 */
export async function getFileFromS3(key: string): Promise<GetObjectOutput> {
  if (!key) {
    return {};
  }

  return S3.getObject({ Bucket: OBJECT_STORE_BUCKET_NAME, Key: key }).promise();
}

/**
 * Get file list from S3, based on name prefix
 * @param prefix
 */
export async function getFileListFromS3(prefix: string): Promise<ListObjectsOutput> {
  if (!prefix) {
    return {};
  }

  const params = {
    Bucket: OBJECT_STORE_BUCKET_NAME,
    Prefix: prefix
  };

  defaultLog.debug('params:', params);

  return S3.listObjects(params).promise();
}

/**
 * Upload a file to S3.
 *
 * Note: Assigns the `authenticated-read` permission.
 *
 * @export
 * @param {MediaBase64} media an object containing information about a single piece of media
 * @param {Metadata} [metadata={}] A metadata object to store additional information with the file
 * @returns {Promise<ManagedUpload.SendData>} the response from S3 or null if required parameters are null
 */
export async function uploadFileToS3(media: MediaBase64, metadata: Metadata = {}): Promise<ManagedUpload.SendData> {
  if (!media) {
    return {
      Location: '',
      ETag: '',
      Key: '',
      Bucket: ''
    };
  }

  // This format creates a folder, but will not append a second file
  const key = `${projectId}/${media.mediaName}`;

  console.log('key: ', key);

  return S3.upload({
    Bucket: OBJECT_STORE_BUCKET_NAME,
    Body: media.mediaBuffer,
    ContentType: media.contentType,
    Key: key,
    ACL: S3_ROLE.AUTH_READ,
    Metadata: metadata
  }).promise();
}

/**
 * Get an s3 signed url.
 *
 * @param {string} key S3 object key
 * @returns {Promise<string>} the response from S3 or null if required parameters are null
 */
export async function getS3SignedURL(key: string): Promise<string> {
  if (!key) {
    return '';
  }

  return S3.getSignedUrl('getObject', {
    Bucket: OBJECT_STORE_BUCKET_NAME,
    Key: key,
    Expires: 300000 // 5 minutes
  });
}

// Regex matches a Data URL base64 encoded string, and has matching groups for the content type and raw encoded string
const base64DataURLRegex = new RegExp(/^data:(\w+\/\w+);base64,(.*)/);

/**
 * Takes a Data URL base64 encoded string, and parses out the contentType (`image/jpeg`, `file/png`, etc) and the
 * base64 contentString.
 *
 * @export
 * @param {string} base64String
 * @return {{ contentType: string; contentString: string }} returns an object with the Data URL encoded strings
 * contentType and contentString, or null if string is invalid or encoded incorrectly.
 */
export function parseBase64DataURLString(base64String: string): { contentType: string; contentString: string } {
  if (!base64String) {
    return {
      contentType: '',
      contentString: ''
    };
  }

  const matches = base64String.match(base64DataURLRegex);

  if (!matches || matches.length !== 3) {
    return {
      contentType: '',
      contentString: ''
    };
  }

  return { contentType: matches[1], contentString: matches[2] };
}
