import { expect } from 'chai';
import { describe } from 'mocha';
import { deleteFileFromS3, generateS3FileKey, getS3HostUrl, getS3SignedURL } from './file-utils';

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

    expect(result).to.equal('projects/1/testFileName');
  });

  it('returns survey file path', async () => {
    const result = generateS3FileKey({ projectId: 1, surveyId: 2, fileName: 'testFileName' });

    expect(result).to.equal('projects/1/surveys/2/testFileName');
  });

  it('returns project folder file path', async () => {
    const result = generateS3FileKey({ projectId: 1, folder: 'folder', fileName: 'testFileName' });

    expect(result).to.equal('projects/1/folder/testFileName');
  });

  it('returns survey folder file path', async () => {
    const result = generateS3FileKey({ projectId: 1, surveyId: 2, folder: 'folder', fileName: 'testFileName' });

    expect(result).to.equal('projects/1/surveys/2/folder/testFileName');
  });
  it('returns survey occurrence folder file path', async () => {
    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      submissionId: 3,
      fileName: 'testFileName'
    });

    expect(result).to.equal('projects/1/surveys/2/submissions/3/testFileName');
  });
  it('returns survey summaryresults folder file path', async () => {
    const result = generateS3FileKey({
      projectId: 1,
      surveyId: 2,
      summaryId: 3,
      fileName: 'testFileName'
    });

    expect(result).to.equal('projects/1/surveys/2/summaryresults/3/testFileName');
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
