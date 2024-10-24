import { S3Client } from '@aws-sdk/client-s3';
import { expect } from 'chai';
import { describe } from 'mocha';
import {
  bulkDeleteFilesFromS3,
  deleteFileFromS3,
  generateS3FileKey,
  getS3HostUrl,
  getS3KeyPrefix,
  getS3SignedURL,
  _getClamAvScanner,
  _getObjectStoreBucketName,
  _getObjectStoreUrl,
  _getS3Client
} from './file-utils';

describe('deleteFileFromS3', () => {
  it('returns null when no key specified', async () => {
    const result = await deleteFileFromS3(null as unknown as string);

    expect(result).to.be.null;
  });
});

describe('bulkDeleteFilesFromS3', () => {
  it('returns null when no keys provided', async () => {
    const result = await bulkDeleteFilesFromS3([]);

    expect(result).to.be.null;
  });
});

describe('getS3SignedURL', () => {
  it('returns null when no key specified', async () => {
    const result = await getS3SignedURL(null as unknown as string);

    expect(result).to.be.null;
  });
});

describe('generateS3FileKey', () => {
  const S3_KEY_PREFIX = process.env.S3_KEY_PREFIX;

  afterEach(() => {
    process.env.S3_KEY_PREFIX = S3_KEY_PREFIX;
  });

  it('returns project file path', async () => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';

    const result = generateS3FileKey({ projectId: 1, fileName: 'testFileName' });

    expect(result).to.equal('some/s3/prefix/projects/1/testFileName');
  });

  it('returns survey file path', async () => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';

    const result = generateS3FileKey({ projectId: 1, surveyId: 2, fileName: 'testFileName' });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/testFileName');
  });

  it('returns project folder file path', async () => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';

    const result = generateS3FileKey({ projectId: 1, folder: 'reports', fileName: 'testFileName' });

    expect(result).to.equal('some/s3/prefix/projects/1/reports/testFileName');
  });

  it('returns survey folder file path', async () => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';

    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      folder: 'telemetry-credentials',
      fileName: 'testFileName'
    });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/telemetry-credentials/testFileName');
  });

  it('returns survey submission folder file path when a submission ID is passed', async () => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';

    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      submissionId: 3,
      fileName: 'testFileName'
    });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/submissions/3/testFileName');
  });

  it('returns critter captures folder file path', async () => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';

    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      critterId: 3,
      folder: 'captures',
      critterbaseCaptureId: '123-456-789',
      fileName: 'testFileName'
    });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/critters/3/captures/123-456-789/testFileName');
  });

  it('returns critter mortalities folder file path', async () => {
    process.env.S3_KEY_PREFIX = 'some/s3/prefix';

    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      critterId: 3,
      folder: 'mortalities',
      critterbaseMortalityId: '123-456-789',
      fileName: 'testFileName'
    });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/critters/3/mortalities/123-456-789/testFileName');
  });
});

describe('getS3HostUrl', () => {
  const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL;
  const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME;

  afterEach(() => {
    process.env.OBJECT_STORE_URL = OBJECT_STORE_URL;
    process.env.OBJECT_STORE_BUCKET_NAME = OBJECT_STORE_BUCKET_NAME;
  });

  it('should yield a default S3 host url', () => {
    delete process.env.OBJECT_STORE_URL;
    delete process.env.OBJECT_STORE_BUCKET_NAME;

    const result = getS3HostUrl();

    expect(result).to.equal('https://nrs.objectstore.gov.bc.ca');
  });

  it('should successfully produce an S3 host url', () => {
    process.env.OBJECT_STORE_URL = 'http://s3.host.example.com';
    process.env.OBJECT_STORE_BUCKET_NAME = 'test-bucket-name';

    const result = getS3HostUrl();

    expect(result).to.equal('http://s3.host.example.com/test-bucket-name');
  });

  it('should successfully append a key to an S3 host url', () => {
    process.env.OBJECT_STORE_URL = 's3.host.example.com';
    process.env.OBJECT_STORE_BUCKET_NAME = 'test-bucket-name';

    const result = getS3HostUrl('my-test-file.txt');

    expect(result).to.equal('https://s3.host.example.com/test-bucket-name/my-test-file.txt');
  });
});

describe('_getS3Client', () => {
  const OBJECT_STORE_ACCESS_KEY_ID = process.env.OBJECT_STORE_ACCESS_KEY_ID;

  afterEach(() => {
    process.env.OBJECT_STORE_ACCESS_KEY_ID = OBJECT_STORE_ACCESS_KEY_ID;
  });

  it('should return an S3 client', () => {
    process.env.OBJECT_STORE_ACCESS_KEY_ID = 'aaaa';
    process.env.OBJECT_STORE_SECRET_KEY_ID = 'bbbb';

    const result = _getS3Client();
    expect(result).to.be.instanceOf(S3Client);
  });
});

describe('_getClamAvScanner', () => {
  const ENABLE_FILE_VIRUS_SCAN = process.env.ENABLE_FILE_VIRUS_SCAN;
  const CLAMAV_HOST = process.env.CLAMAV_HOST;
  const CLAMAV_PORT = process.env.CLAMAV_PORT;

  afterEach(() => {
    process.env.ENABLE_FILE_VIRUS_SCAN = ENABLE_FILE_VIRUS_SCAN;
    process.env.CLAMAV_HOST = CLAMAV_HOST;
    process.env.CLAMAV_PORT = CLAMAV_PORT;
  });

  it('should return a clamAv scanner client', () => {
    process.env.ENABLE_FILE_VIRUS_SCAN = 'true';
    process.env.CLAMAV_HOST = 'host';
    process.env.CLAMAV_PORT = '1111';

    const result = _getClamAvScanner();
    expect(result).to.not.be.null;
  });
});

describe('_getObjectStoreBucketName', () => {
  const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME;

  afterEach(() => {
    process.env.OBJECT_STORE_BUCKET_NAME = OBJECT_STORE_BUCKET_NAME;
  });

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
  const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL;

  afterEach(() => {
    process.env.OBJECT_STORE_URL = OBJECT_STORE_URL;
  });

  it('should return an object store bucket name that http protocol', () => {
    process.env.OBJECT_STORE_URL = 'http://s3.host.example.com';

    const result = _getObjectStoreUrl();
    expect(result).to.equal('http://s3.host.example.com');
  });

  it('should return an object store bucket name that https protocol', () => {
    process.env.OBJECT_STORE_URL = 'https://s3.host.example.com';

    const result = _getObjectStoreUrl();
    expect(result).to.equal('https://s3.host.example.com');
  });

  it('should return an object store bucket name that had no protocol', () => {
    process.env.OBJECT_STORE_URL = 's3.host.example.com';

    const result = _getObjectStoreUrl();
    expect(result).to.equal('https://s3.host.example.com');
  });

  it('should return its default value', () => {
    delete process.env.OBJECT_STORE_URL;

    const result = _getObjectStoreUrl();
    expect(result).to.equal('https://nrs.objectstore.gov.bc.ca');
  });
});

describe('getS3KeyPrefix', () => {
  const OLD_S3_KEY_PREFIX = process.env.S3_KEY_PREFIX;

  afterEach(() => {
    process.env.S3_KEY_PREFIX = OLD_S3_KEY_PREFIX;
  });

  it('should return an s3 key prefix', () => {
    process.env.S3_KEY_PREFIX = 'test-sims';

    const result = getS3KeyPrefix();
    expect(result).to.equal('test-sims');
  });

  it('should return its default value', () => {
    delete process.env.S3_KEY_PREFIX;

    const result = getS3KeyPrefix();
    expect(result).to.equal('sims');
  });
});
