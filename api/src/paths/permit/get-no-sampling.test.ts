import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as get_no_sampling from './get-no-sampling';
import * as db from '../../database/db';
import permit_queries from '../../queries/permit';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../__mocks__/db';
import { HTTPError } from '../../errors/custom-error';

chai.use(sinonChai);

describe('getNonSamplingPermits', () => {
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

  it('should throw a 400 error when no sql statement returned for non-sampling permits', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(permit_queries, 'getNonSamplingPermitsSQL').returns(null);

    try {
      const result = get_no_sampling.getNonSamplingPermits();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return non-sampling permits on success', async () => {
    const nonSamplingPermits = [
      {
        permit_id: 1,
        number: '123',
        type: 'scientific'
      },
      {
        permit_id: 2,
        number: '12345',
        type: 'wildlife'
      }
    ];

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: nonSamplingPermits });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(permit_queries, 'getNonSamplingPermitsSQL').returns(SQL`some query`);

    const result = get_no_sampling.getNonSamplingPermits();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql(nonSamplingPermits);
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

    sinon.stub(permit_queries, 'getNonSamplingPermitsSQL').returns(SQL`some query`);

    const result = get_no_sampling.getNonSamplingPermits();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });
});
