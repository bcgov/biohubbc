import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as list from './list';
import * as db from '../../../../../database/db';
import project_queries from '../../../../../queries/project';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import { HTTPError } from '../../../../../errors/custom-error';

chai.use(sinonChai);

describe('getSurveyFundingSources', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1
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

  it('should throw a 400 error when no project id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = list.getSurveyFundingSources();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for survey funding sources', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_queries, 'getFundingSourceByProjectSQL').returns(null);

    try {
      const result = list.getSurveyFundingSources();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return the survey funding sources on success', async () => {
    const surveyFundingSources = [
      {
        id: 1,
        agency_id: 1,
        funding_amount: 100,
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        investment_action_category: 1,
        investment_action_category_name: 'name iac',
        agency_name: 'name agency',
        agency_project_id: 10,
        revision_count: 1
      }
    ];

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: surveyFundingSources });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getFundingSourceByProjectSQL').returns(SQL`some query`);

    const result = list.getSurveyFundingSources();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([
      {
        pfsId: 1,
        agencyName: 'name agency',
        startDate: '2020/04/04',
        endDate: '2020/05/05',
        amount: 100
      }
    ]);
  });

  it('should return null when survey funding sources response has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getFundingSourceByProjectSQL').returns(SQL`some query`);

    const result = list.getSurveyFundingSources();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
