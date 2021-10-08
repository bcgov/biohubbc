import { GetObjectOutput } from 'aws-sdk/clients/s3';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CustomError } from '../errors/CustomError';
import * as file_utils from '../utils/file-utils';
import { getS3File } from './file';

chai.use(sinonChai);

const sampleReq = {
  keycloak_token: {},
  body: {
    occurrence_submission_id: 1
  }
} as any;

describe('getS3File', () => {
  const updatedSampleReq = { ...sampleReq, s3Key: 'somekey' };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 500 error when no file in S3', async () => {
    sinon.stub(file_utils, 'getFileFromS3').resolves(undefined);

    try {
      const requestHandler = getS3File();
      await requestHandler(updatedSampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(500);
      expect((actualError as CustomError).message).to.equal('Failed to get file from S3');
    }
  });

  it('should set the s3 file in the request on success', async () => {
    const file = {
      fieldname: 'media',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 340
    };

    const nextSpy = sinon.spy();

    sinon.stub(file_utils, 'getFileFromS3').resolves(file as GetObjectOutput);

    const requestHandler = getS3File();
    await requestHandler(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.s3File).to.eql(file);
    expect(nextSpy).to.have.been.called;
  });
});
