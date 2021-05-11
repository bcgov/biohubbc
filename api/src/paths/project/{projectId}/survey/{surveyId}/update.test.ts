import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as update from './update';
import * as db from '../../../../../database/db';
import * as survey_view_update_queries from '../../../../../queries/survey/survey-view-update-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getSurveyForUpdate', () => {
  afterEach(() => {
    sinon.restore();
  });

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
      projectId: 1,
      surveyId: 2
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no get survey sql statement produced', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(survey_view_update_queries, 'getSurveySQL').returns(null);

    try {
      const result = update.getSurveyForUpdate();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return the survey row on success', async () => {
    const survey = {
      name: 'name',
      objectives: 'objective',
      species: 'species',
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      lead_first_name: 'first',
      lead_last_name: 'last',
      location_name: 'location',
      revision_count: 1
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [survey] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_update_queries, 'getSurveySQL').returns(SQL`some query`);

    const result = update.getSurveyForUpdate();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      survey_name: survey.name,
      survey_purpose: survey.objectives,
      species: survey.species,
      start_date: survey.start_date,
      end_date: survey.end_date,
      biologist_first_name: survey.lead_first_name,
      biologist_last_name: survey.lead_last_name,
      survey_area_name: survey.location_name,
      revision_count: survey.revision_count
    });
  });

  it('should return null when response has no rows (no survey found)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_update_queries, 'getSurveySQL').returns(SQL`some query`);

    const result = update.getSurveyForUpdate();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
