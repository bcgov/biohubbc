import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../../database/db';
import * as survey_occurrence_queries from '../../../../../queries/survey/survey-occurrence-queries';
import * as survey_update_queries from '../../../../../queries/survey/survey-update-queries';
import * as publish from './publish';

chai.use(sinonChai);

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
  params: {
    surveyId: 1
  },
  body: {
    publish: true
  }
} as any;

let actualStatus = 0;

const sampleRes = {
  status: (status: number) => {
    actualStatus = status;

    return {
      send: () => {
        // do nothing
      }
    };
  }
} as any;

const sampleNext = {} as any;

describe('publishSurveyAndOccurrences', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when missing request param surveyId', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result(
        { ...sampleReq, body: { ...sampleReq.body }, params: { surveyId: undefined } },
        sampleRes,
        sampleNext
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Missing required path parameter: surveyId');
      expect(actualError.status).to.equal(400);
    }
  });

  it('should throw a 400 error when missing request body', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result({ ...sampleReq, body: (null as unknown) as any }, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Missing request body');
      expect(actualError.status).to.equal(400);
    }
  });

  it('should throw a 400 error when missing publish flag in request body', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result({ ...sampleReq, body: { ...sampleReq.body, publish: undefined } }, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Missing publish flag in request body');
      expect(actualError.status).to.equal(400);
    }
  });

  it('should throw a 400 error when no occurrence submission sql statement produced', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_occurrence_queries, 'getLatestSurveyOccurrenceSubmission').returns(null);

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result(sampleReq, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Failed to build get survey occurrence submission SQL statement');
      expect(actualError.status).to.equal(400);
    }
  });

  it('should throw a 500 error when no occurrence submission result', async () => {
    const mockQuery = sinon.stub();
    mockQuery.resolves(null);

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_occurrence_queries, 'getLatestSurveyOccurrenceSubmission').returns(SQL`some query`);

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result(sampleReq, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Failed to get survey occurrence submissions');
      expect(actualError.status).to.equal(500);
    }
  });

  it('should throw a 400 error when no delete occurrence submission sql statement produced', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(publish, 'getSurveyOccurrenceSubmission').resolves({ occurrence_submission_id: 1 });

    sinon.stub(survey_occurrence_queries, 'deleteSurveyOccurrencesSQL').returns(null);

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result({ ...sampleReq, body: { publish: false } }, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Failed to build delete survey occurrences SQL statement');
      expect(actualError.status).to.equal(400);
    }
  });

  it('should throw a 500 error when no delete occurrence submission result', async () => {
    const mockQuery = sinon.stub();
    mockQuery.onCall(0).resolves(null); // delete survey occurrences result

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(publish, 'getSurveyOccurrenceSubmission').resolves({ occurrence_submission_id: 1 });

    sinon.stub(survey_occurrence_queries, 'deleteSurveyOccurrencesSQL').returns(SQL`some query`);

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result({ ...sampleReq, body: { publish: false } }, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Failed to delete survey occurrences');
      expect(actualError.status).to.equal(500);
    }
  });

  it('should throw an error when parsing/inserting occurrences fails', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(publish, 'insertOccurrences').throws('An occurrence error');

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result(sampleReq, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('An occurrence error');
      expect(actualError.status).to.equal(500);
    }
  });

  it('should throw a 400 error when no publish survey sql statement produced', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(publish, 'insertOccurrences').resolves();

    sinon.stub(survey_update_queries, 'updateSurveyPublishStatusSQL').returns(null);

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result(sampleReq, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Failed to build survey publish SQL statement');
      expect(actualError.status).to.equal(400);
    }
  });

  it('should throw a 500 error when no publish survey result', async () => {
    const mockQuery = sinon.stub();
    mockQuery.onCall(0).resolves(null); // update survey result

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(publish, 'insertOccurrences').resolves();

    sinon.stub(survey_update_queries, 'updateSurveyPublishStatusSQL').returns(SQL`some query`);

    try {
      const result = publish.publishSurveyAndOccurrences();

      await result(sampleReq, sampleRes, sampleNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal('Failed to update survey publish status');
      expect(actualError.status).to.equal(500);
    }
  });

  it('should return 200 OK on success', async () => {
    const mockQuery = sinon.stub();
    mockQuery.onCall(0).resolves({ rowCount: 1 }); // update survey result

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return {
          rowCount: 1,
          rows: [
            {
              id: 1,
              create_date: '2020/04/04'
            }
          ]
        } as QueryResult<any>;
      }
    });

    sinon.stub(publish, 'insertOccurrences').resolves();

    sinon.stub(survey_update_queries, 'updateSurveyPublishStatusSQL').returns(SQL`some query`);

    const result = publish.publishSurveyAndOccurrences();

    await result(sampleReq, sampleRes, sampleNext);

    expect(actualStatus).to.equal(200);
  });
});
