import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as validate from './validate';
import * as db from '../../database/db';
import * as survey_occurrence_queries from '../../queries/survey/survey-occurrence-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getSubmissionS3Key', () => {
  const dbConnectionObj = {
    systemUserId: () => {
      return null;
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

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no occurrence submission id is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = validate.getSubmissionS3Key();
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
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_occurrence_queries, 'getSurveyOccurrenceSubmissionSQL').returns(null);

    try {
      const result = validate.getSubmissionS3Key();

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
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_occurrence_queries, 'getSurveyOccurrenceSubmissionSQL').returns(SQL`something`);

    try {
      const result = validate.getSubmissionS3Key();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to get survey occurrence submission');
    }
  });

  it('should set the s3 key in the request on success', async () => {
    const nextSpy = sinon.spy();
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [{ key: 'somekey' }]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_occurrence_queries, 'getSurveyOccurrenceSubmissionSQL').returns(SQL`something`);

    const result = validate.getSubmissionS3Key();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.s3Key).to.equal('somekey');
    expect(nextSpy).to.have.been.called;
  });
});
