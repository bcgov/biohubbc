import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as list from './list';
import * as db from '../../database/db';
import permit_queries from '../../queries/permit';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../__mocks__/db';
import { HTTPError } from '../../errors/custom-error';

chai.use(sinonChai);

describe('getAllPermits', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
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

  it('should throw a 400 error when no sql statement returned for permits', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(permit_queries, 'getAllPermitsSQL').returns(null);

    try {
      const result = list.getAllPermits();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return all permits on success', async () => {
    const allPermits = [
      {
        id: 1,
        number: '123',
        type: 'scientific',
        coordinator_agency: 'agency',
        project_name: 'project 1'
      },
      {
        id: 2,
        number: '12345',
        type: 'wildlife',
        coordinator_agency: 'agency 2',
        project_name: null
      }
    ];

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: allPermits });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(permit_queries, 'getAllPermitsSQL').returns(SQL`some query`);

    const result = list.getAllPermits();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql(allPermits);
  });

  it('should return null when permits response has no rows', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(permit_queries, 'getAllPermitsSQL').returns(SQL`some query`);

    const result = list.getAllPermits();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
