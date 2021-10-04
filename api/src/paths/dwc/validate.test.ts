import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as validate from './validate';
import * as db from '../../database/db';
import * as survey_occurrence_queries from '../../queries/survey/survey-occurrence-queries';
import SQL from 'sql-template-strings';
import * as file_utils from '../../utils/file-utils';
import { GetObjectOutput } from 'aws-sdk/clients/s3';

chai.use(sinonChai);

const dbConnectionObj = {
  systemUserId: () => {
    return 20;
  },
  open: async () => {
    // do nothing
  },
  release: () => {
    // do nothing
  },
  commit: async () => {
    // do nothing
  },
  rollback: async () => {
    // do nothing
  },
  query: async () => {
    // do nothing
  }
};

const sampleReq = {
  keycloak_token: {},
  body: {
    occurrence_submission_id: 1
  }
} as any;

describe('getOccurrenceSubmission', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {
      occurrence_submission_id: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no occurrence submission id is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = validate.getOccurrenceSubmission();
      await result(
        { ...sampleReq, body: { ...sampleReq.body, occurrence_submission_id: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param `occurrence_submission_id`.');
    }
  });

  it('should throw a 400 error when no sql statement returned for getSurveyOccurrenceSubmissionSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(survey_occurrence_queries, 'getSurveyOccurrenceSubmissionSQL').returns(null);

    try {
      const result = validate.getOccurrenceSubmission();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no rows returned', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: []
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon.stub(survey_occurrence_queries, 'getSurveyOccurrenceSubmissionSQL').returns(SQL`something`);

    try {
      const result = validate.getOccurrenceSubmission();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to get survey occurrence submission');
    }
  });

  // TODO update this test as teh s3 key is not part of the `getOccurrenceSubmission` step now
  it('should set occurrence_submission in the request on success', async () => {
    const nextSpy = sinon.spy();
    const mockQuery = sinon.stub();

    const expectedRecord = { id: 123, input_file_name: 'someFile', input_key: 'somekey' };

    mockQuery.resolves({
      rows: [expectedRecord]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    sinon.stub(survey_occurrence_queries, 'getSurveyOccurrenceSubmissionSQL').returns(SQL`something`);

    const result = validate.getOccurrenceSubmission();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.occurrence_submission).to.eql(expectedRecord);
    expect(nextSpy).to.have.been.called;
  });
});

describe('getS3File', () => {
  const updatedSampleReq = { ...sampleReq, s3Key: 'somekey' };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 500 error when no file in S3', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(file_utils, 'getFileFromS3').resolves(undefined);

    try {
      const result = validate.getS3File();
      await result(updatedSampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(500);
      expect(actualError.message).to.equal('Failed to get file from S3');
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

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
    sinon.stub(file_utils, 'getFileFromS3').resolves(file as GetObjectOutput);

    const result = validate.getS3File();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.s3File).to.eql(file);
    expect(nextSpy).to.have.been.called;
  });
});
