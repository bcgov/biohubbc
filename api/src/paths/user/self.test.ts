import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as self from './self';
import * as db from '../../database/db';
import * as user_queries from '../../queries/users/user-queries';
import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('getUser', function () {
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
    keycloak_token: {}
  };

  let expectedResult = {
    id: null,
    user_identifier: null,
    role_ids: null,
    role_names: null
  };

  const sampleRes = {
    status: (status: number) => {
      return {
        json: (result: any) => {
          expectedResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no system user id', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = self.getUser();

      // eslint-disable-next-line
      //@ts-ignore
      await result(sampleReq, null, null);
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to identify system user ID');
    }
  });

  it('should throw a 400 error when no sql statement produced', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(user_queries, 'getUserByIdSQL').returns(null);

    try {
      const result = self.getUser();

      // eslint-disable-next-line
      //@ts-ignore
      await result(sampleReq, null, null);
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return the user row on success', async () => {
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
              user_identifier: 'identifier',
              role_ids: [1, 2],
              role_names: ['role 1', 'role 2']
            }
          ]
        } as QueryResult<any>;
      }
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

    const result = self.getUser();

    // eslint-disable-next-line
    //@ts-ignore
    await result(sampleReq, sampleRes, null);

    expect(expectedResult.id).to.equal(1);
    expect(expectedResult.user_identifier).to.equal('identifier');
    expect(expectedResult.role_ids).to.eql([1, 2]);
    expect(expectedResult.role_names).to.eql(['role 1', 'role 2']);
  });

  it('should throw an error when a failure occurs', async () => {
    const expectedError = new Error('cannot process query');

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        throw expectedError;
      }
    });

    try {
      const result = self.getUser();

      // eslint-disable-next-line
      //@ts-ignore
      await result(sampleReq, null, null);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal(expectedError.message);
    }
  });

  it('should return null when response has no rowCount (no user found)', async function () {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: async () => {
        return ({
          rowCount: 0,
          rows: []
        } as unknown) as QueryResult<any>;
      }
    });

    sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

    const result = self.getUser();

    // eslint-disable-next-line
    //@ts-ignore
    await result(sampleReq, sampleRes, null);

    expect(expectedResult).to.be.null;
  });
});
