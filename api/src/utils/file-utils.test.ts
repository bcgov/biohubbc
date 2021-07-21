import { expect } from 'chai';
import { describe } from 'mocha';
import { deleteFileFromS3, generateS3FileKey, getS3SignedURL } from './file-utils';

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
});
