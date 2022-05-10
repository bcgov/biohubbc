import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import project_queries from '../../../../queries/project';
import { getMockDBConnection } from '../../../../__mocks__/db';
import * as addFunding from './add';

chai.use(sinonChai);

describe('add a funding source', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      id: 0,
      agency_id: 'agencyId',
      investment_action_category: 1,
      agency_project_id: 1,
      funding_amount: 1,
      start_date: '2021-01-01',
      end_date: '2021-01-01'
    },
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

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = addFunding.addFundingSource();
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

  it('should throw a 400 error when no request body present', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = addFunding.addFundingSource();

      await result({ ...sampleReq, body: null }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing funding source data');
    }
  });

  it('should throw a 400 error when addFundingSource fails, because result has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'postProjectFundingSourceSQL').returns(SQL`some query`);

    try {
      const result = addFunding.addFundingSource();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert project funding source data');
    }
  });

  it('should throw a 400 error when no sql statement returned for addFundingSourceSQL', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_queries, 'postProjectFundingSourceSQL').returns(null);

    try {
      const result = addFunding.addFundingSource();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build addFundingSourceSQLStatement');
    }
  });

  it('should throw a 400 error when the AddFundingSource fails because result has no id', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: null }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'postProjectFundingSourceSQL').returns(SQL`some query`);

    try {
      const result = addFunding.addFundingSource();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert project funding source data');
    }
  });

  it('should return the new funding source id on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 23 }] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'postProjectFundingSourceSQL').returns(SQL`something`);

    const result = addFunding.addFundingSource();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({ id: 23 });
  });
});
