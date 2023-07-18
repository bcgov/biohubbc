import AWS from 'aws-sdk';
import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
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
  let sinonSandbox = sinon.createSandbox();

  afterEach(() => {
    sinonSandbox.restore();
  });

  it('returns project file path', async () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value('some/s3/prefix');

    const result = generateS3FileKey({ projectId: 1, fileName: 'testFileName' });

    expect(result).to.equal('some/s3/prefix/projects/1/testFileName');
  });

  it('returns survey file path', async () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value('some/s3/prefix');

    const result = generateS3FileKey({ projectId: 1, surveyId: 2, fileName: 'testFileName' });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/testFileName');
  });

  it('returns project folder file path', async () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value('some/s3/prefix');

    const result = generateS3FileKey({ projectId: 1, folder: 'folder', fileName: 'testFileName' });

    expect(result).to.equal('some/s3/prefix/projects/1/folder/testFileName');
  });

  it('returns survey folder file path', async () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value('some/s3/prefix');

    const result = generateS3FileKey({ projectId: 1, surveyId: 2, folder: 'folder', fileName: 'testFileName' });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/folder/testFileName');
  });

  it('returns survey occurrence folder file path', async () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value('some/s3/prefix');

    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      submissionId: 3,
      fileName: 'testFileName'
    });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/submissions/3/testFileName');
  });

  it('returns survey summaryresults folder file path', async () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value('some/s3/prefix');

    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      summaryId: 3,
      fileName: 'testFileName'
    });

    expect(result).to.equal('some/s3/prefix/projects/1/surveys/2/summaryresults/3/testFileName');
  });
});

describe('getS3HostUrl', () => {
  let sinonSandbox = sinon.createSandbox();

  afterEach(() => {
    sinonSandbox.restore();
  });

  it('should yield a default S3 host url', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_URL').value(undefined);
    sinonSandbox.stub(process.env, 'OBJECT_STORE_BUCKET_NAME').value(undefined);
    const result = getS3HostUrl();

    expect(result).to.equal('nrs.objectstore.gov.bc.ca');
  });

  it('should successfully produce an S3 host url', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_URL').value('s3.host.example.com');
    sinonSandbox.stub(process.env, 'OBJECT_STORE_BUCKET_NAME').value('test-bucket-name');

    const result = getS3HostUrl();

    expect(result).to.equal('s3.host.example.com/test-bucket-name');
  });

  it('should successfully append a key to an S3 host url', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_URL').value('s3.host.example.com');
    sinonSandbox.stub(process.env, 'OBJECT_STORE_BUCKET_NAME').value('test-bucket-name');

    const result = getS3HostUrl('my-test-file.txt');

    expect(result).to.equal('s3.host.example.com/test-bucket-name/my-test-file.txt');
  });
});

describe('_getS3Client', () => {
  let sinonSandbox = sinon.createSandbox();

  afterEach(() => {
    sinonSandbox.restore();
  });

  it('should return an S3 client', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_ACCESS_KEY_ID').value('aaaa');
    sinonSandbox.stub(process.env, 'OBJECT_STORE_SECRET_KEY_ID').value('bbbb');

    const result = _getS3Client();
    expect(result).to.be.instanceOf(AWS.S3);
  });
});

describe('_getClamAvScanner', () => {
  let sinonSandbox = sinon.createSandbox();

  afterEach(() => {
    sinonSandbox.restore();
  });

  it('should return a clamAv scanner client', () => {
    sinonSandbox.stub(process.env, 'ENABLE_FILE_VIRUS_SCAN').value('true');
    sinonSandbox.stub(process.env, 'CLAMAV_HOST').value('host');
    sinonSandbox.stub(process.env, 'CLAMAV_PORT').value('1111');

    const result = _getClamAvScanner();
    expect(result).to.not.be.null;
  });

  it('should return null if enable file virus scan is not set to true', () => {
    sinonSandbox.stub(process.env, 'ENABLE_FILE_VIRUS_SCAN').value('false');
    sinonSandbox.stub(process.env, 'CLAMAV_HOST').value('host');
    sinonSandbox.stub(process.env, 'CLAMAV_PORT').value('1111');

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });

  it('should return null if CLAMAV_HOST is not set', () => {
    sinonSandbox.stub(process.env, 'ENABLE_FILE_VIRUS_SCAN').value('true');
    sinonSandbox.stub(process.env, 'CLAMAV_HOST').value(undefined);
    sinonSandbox.stub(process.env, 'CLAMAV_PORT').value('1111');

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });

  it('should return null if CLAMAV_PORT is not set', () => {
    sinonSandbox.stub(process.env, 'ENABLE_FILE_VIRUS_SCAN').value('true');
    sinonSandbox.stub(process.env, 'CLAMAV_HOST').value('host');
    sinonSandbox.stub(process.env, 'CLAMAV_PORT').value(undefined);

    const result = _getClamAvScanner();
    expect(result).to.be.null;
  });
});

describe('_getObjectStoreBucketName', () => {
  let sinonSandbox = sinon.createSandbox();

  afterEach(() => {
    sinonSandbox.restore();
  });

  it('should return an object store bucket name', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_BUCKET_NAME').value('test-bucket1');

    const result = _getObjectStoreBucketName();
    expect(result).to.equal('test-bucket1');
  });

  it('should return its default value', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_BUCKET_NAME').value(undefined);

    const result = _getObjectStoreBucketName();
    expect(result).to.equal('');
  });
});

describe('_getObjectStoreUrl', () => {
  let sinonSandbox = sinon.createSandbox();

  afterEach(() => {
    sinonSandbox.restore();
  });

  it('should return an object store bucket name', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_URL').value('test-url1');

    const result = _getObjectStoreUrl();
    expect(result).to.equal('test-url1');
  });

  it('should return its default value', () => {
    sinonSandbox.stub(process.env, 'OBJECT_STORE_URL').value(undefined);

    const result = _getObjectStoreUrl();
    expect(result).to.equal('nrs.objectstore.gov.bc.ca');
  });
});

describe('_getS3KeyPrefix', () => {
  let sinonSandbox = sinon.createSandbox();

  afterEach(() => {
    sinonSandbox.restore();
  });

  it('should return an s3 key prefix', () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value('test-sims');

    const result = _getS3KeyPrefix();
    expect(result).to.equal('test-sims');
  });

  it('should return its default value', () => {
    sinonSandbox.stub(process.env, 'S3_KEY_PREFIX').value(undefined);

    const result = _getS3KeyPrefix();
    expect(result).to.equal('sims');
  });
});
