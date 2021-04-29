import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as user from './user';
import * as db from '../database/db';
import * as user_queries from '../queries/users/user-queries';
import { QueryResult } from 'pg';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('user', () => {
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

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      sinon.stub(user_queries, 'addSystemUserSQL').returns(null);

      try {
        await user.addSystemUser('userIdentifier', 'identitySource', 10, {
          ...dbConnectionObj,
          systemUserId: () => {
            return 10;
          }
        });
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to build SQL get statement');
      }
    });

    it('should throw a 500 response when response has no rows', async () => {
      sinon.stub(user_queries, 'addSystemUserSQL').returns(SQL`some query`);

      try {
        await user.addSystemUser('userIdentifier', 'identitySource', 10, {
          ...dbConnectionObj,
          systemUserId: () => {
            return 10;
          },
          query: async () => {
            return ({
              rows: null
            } as unknown) as QueryResult<any>;
          }
        });
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(500);
        expect(actualError.message).to.equal('Failed to add system user');
      }
    });

    it('should return the query rows result on success', async () => {
      sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

      const result = await user.addSystemUser('userIdentifier', 'identitySource', 10, {
        ...dbConnectionObj,
        systemUserId: () => {
          return 10;
        },
        query: async () => {
          return {
            rows: [
              {
                id: 1,
                uis_id: 'uis_id',
                user_identifier: 'user_identifier',
                record_effective_date: '2020/04/04'
              }
            ]
          } as QueryResult<any>;
        }
      });

      expect(result.id).to.equal(1);
    });
  });

  describe('addUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sampleReq = {
      keycloak_token: {},
      body: {
        userIdentifier: 'uid',
        identitySource: 'idsource'
      }
    };

    let actualStatus: number = (null as unknown) as number;

    const sampleRes = {
      send: (status: number) => {
        actualStatus = status;
      }
    };

    it('should throw a 400 error when no req body', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addUser();

        await result({ ...(sampleReq as any), body: null }, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no userIdentifier', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addUser();

        await result(
          { ...(sampleReq as any), body: { ...sampleReq.body, userIdentifier: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no identitySource', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addUser();

        await result(
          { ...(sampleReq as any), body: { ...sampleReq.body, identitySource: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Missing required body param: identitySource');
      }
    });

    it('should throw a 400 error when no system user id', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addUser();

        await result(sampleReq as any, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
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
      sinon.stub(user_queries, 'addSystemUserSQL').returns(null);

      try {
        const result = user.addUser();

        await result(sampleReq as any, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to build SQL get statement');
      }
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
        const result = user.addUser();

        await result(sampleReq as any, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.message).to.equal(expectedError.message);
      }
    });

    it('should throw a 500 response when response has no rows', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return ({
            rows: null
          } as unknown) as QueryResult<any>;
        }
      });
      sinon.stub(user_queries, 'addSystemUserSQL').returns(SQL`some query`);

      try {
        const result = user.addUser();

        await result(sampleReq as any, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(500);
        expect(actualError.message).to.equal('Failed to add system user');
      }
    });

    it('should return status 200 on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rows: [
              {
                id: 1,
                uis_id: 'uis_id',
                user_identifier: 'user_identifier',
                record_effective_date: '2020/04/04'
              }
            ]
          } as QueryResult<any>;
        }
      });

      sinon.stub(user_queries, 'getUserByIdSQL').returns(SQL`some query`);

      const result = user.addUser();

      await result(sampleReq as any, sampleRes as any, (null as unknown) as any);

      expect(actualStatus).to.equal(200);
    });
  });
});
