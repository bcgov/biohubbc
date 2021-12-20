import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { CustomError } from '../../../errors/CustomError';
import { getMockDBConnection } from '../../../__mocks__/db';
import * as user from './get';
import * as user_view_queries from '../../../queries/users/user-queries';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('user', () => {
  const dbConnectionObj = getMockDBConnection();

  describe('getUserById', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sampleReq = {
      keycloak_token: {},
      params: {
        userId: 1
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

    it('should throw a 400 error when no params are sent', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.getUserById();

        await result({ ...(sampleReq as any), params: null }, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as CustomError).status).to.equal(400);
        expect((actualError as CustomError).message).to.equal('Missing required params');
      }
    });

    it('should throw a 400 error when no user Id is sent', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.getUserById();

        await result(
          { ...(sampleReq as any), params: { ...sampleReq.params, userId: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as CustomError).status).to.equal(400);
        expect((actualError as CustomError).message).to.equal('Missing required param: userId');
      }
    });

    it('should throw a 400 error when no sql statement returned for getProjectSQL', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      sinon.stub(user_view_queries, 'getUserByIdSQL').returns(null);

      try {
        const result = user.getUserById();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as CustomError).status).to.equal(400);
        expect((actualError as CustomError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('finds user by Id and returns 200 and result on success', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: [{ id: 123, userIdentifer: 'test' }] });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });

      sinon.stub(user_view_queries, 'getUserByIdSQL').returns(SQL`something`);

      const result = user.getUserById();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql({ id: 123, userIdentifer: 'test' });
    });
  });
});
