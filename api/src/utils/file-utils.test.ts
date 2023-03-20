import AWS from 'aws-sdk';
import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteFileFromS3,
  generateS3FileKey,
  getS3HostUrl,
  getS3SignedURL,
  _getClamAvScanner,
  _getObjectStoreBucketName,
  _getObjectStoreUrl,
  _getS3Client,
  _getS3KeyPrefix
} from './file-utils';

describe('deleteFileFromS3', () => {
  it('returns null when no key specified', async () => {
    const result = await deleteFileFromS3((null as unknown) as string);

    expect(result).to.be.null;
  });
});

describe('getS3SignedURL', () => {
  it('returns null when no key specified', async () => {
    const result = await getS3SignedURL((null as unknown) as string);

    expect(result).to.be.null;
  });
});

describe('generateS3FileKey', () => {
  it('returns project file path', async () => {
    const result = generateS3FileKey({ projectId: 1, fileName: 'testFileName' });

    expect(result).to.equal('sims/projects/1/testFileName');
  });

  it('returns survey file path', async () => {
    const result = generateS3FileKey({ projectId: 1, surveyId: 2, fileName: 'testFileName' });

    expect(result).to.equal('sims/projects/1/surveys/2/testFileName');
  });

  it('returns project folder file path', async () => {
    const result = generateS3FileKey({ projectId: 1, folder: 'folder', fileName: 'testFileName' });

    expect(result).to.equal('sims/projects/1/folder/testFileName');
  });

  it('returns survey folder file path', async () => {
    const result = generateS3FileKey({ projectId: 1, surveyId: 2, folder: 'folder', fileName: 'testFileName' });

    expect(result).to.equal('sims/projects/1/surveys/2/folder/testFileName');
  });

  it('returns survey occurrence folder file path', async () => {
    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      submissionId: 3,
      fileName: 'testFileName'
    });

    expect(result).to.equal('sims/projects/1/surveys/2/submissions/3/testFileName');
  });

  it('returns survey summaryresults folder file path', async () => {
    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      summaryId: 3,
      fileName: 'testFileName'
    });

    expect(result).to.equal('sims/projects/1/surveys/2/summaryresults/3/testFileName');
  });
});

describe('getS3HostUrl', () => {
  beforeEach(() => {
    process.env.OBJECT_STORE_URL = 's3.host.example.com';
    process.env.OBJECT_STORE_BUCKET_NAME = 'test-bucket-name';
  });

  it('should yield a default S3 host url', () => {
    delete process.env.OBJECT_STORE_URL;
    delete process.env.OBJECT_STORE_BUCKET_NAME;

    const result = getS3HostUrl();

    expect(result).to.equal('nrs.objectstore.gov.bc.ca');
  });

  it('should successfully produce an S3 host url', () => {
    const result = getS3HostUrl();

    expect(result).to.equal('s3.host.example.com/test-bucket-name');
  });

  it('should successfully append a key to an S3 host url', () => {
    const result = getS3HostUrl('my-test-file.txt');

    expect(result).to.equal('s3.host.example.com/test-bucket-name/my-test-file.txt');
  });
});

describe('_getS3Client', () => {
  it('should return an S3 client', () => {
    process.env.OBJECT_STORE_ACCESS_KEY_ID = 'aaaa';
    process.env.OBJECT_STORE_SECRET_KEY_ID = 'bbbb';

    const result = _getS3Client();
    expect(result).to.be.instanceOf(AWS.S3);
  });
});

describe('_getClamAvScanner', () => {
  it('should return a clamAv scanner client', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'true';
    process.env.CLAMAV_HOST = 'host';
    process.env.CLAMAV_PORT = '1111';

    const result = _getClamAvScanner();
    expect(result).to.not.be.null;
  });

  it('should return null if enable file virus scan is not set to true', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'false';
    process.env.CLAMAV_HOST = 'host';
    process.env.CLAMAV_PORT = '1111';

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });

  it('should return null if CLAMAV_HOST is not set', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'true';
    delete process.env.CLAMAV_HOST;
    process.env.CLAMAV_PORT = '1111';

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });

  it('should return null if CLAMAV_PORT is not set', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'true';
    process.env.CLAMAV_HOST = 'host';
    delete process.env.CLAMAV_PORT;

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });
});

describe('_getObjectStoreBucketName', () => {
  it('should return an object store bucket name', () => {
    process.env.OBJECT_STORE_BUCKET_NAME = 'test-bucket1';

    const result = _getObjectStoreBucketName();
    expect(result).to.equal('test-bucket1');
  });

  it('should return its default value', () => {
    delete process.env.OBJECT_STORE_BUCKET_NAME;

    const result = _getObjectStoreBucketName();
    expect(result).to.equal('');
  });
});

describe('_getObjectStoreUrl', () => {
  it('should return an object store bucket name', () => {
    process.env.OBJECT_STORE_URL = 'test-url1';

    const result = _getObjectStoreUrl();
    expect(result).to.equal('test-url1');
  });

  it('should return its default value', () => {
    delete process.env.OBJECT_STORE_URL;

    const result = _getObjectStoreUrl();
    expect(result).to.equal('nrs.objectstore.gov.bc.ca');
  });
});

describe('_getS3KeyPrefix', () => {
  it('should return an s3 key prefix', () => {
    process.env.S3_KEY_PREFIX = 'test-sims';

    const result = _getS3KeyPrefix();
    expect(result).to.equal('test-sims');
  });

  it('should return its default value', () => {
    delete process.env.S3_KEY_PREFIX;

    const result = _getS3KeyPrefix();
    expect(result).to.equal('sims');
  });
});
