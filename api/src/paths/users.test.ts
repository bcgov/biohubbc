import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as users from './users';
import * as db from '../database/db';
import user_queries from '../queries/users';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../__mocks__/db';
import { HTTPError } from '../errors/custom-error';

chai.use(sinonChai);

describe('users', () => {
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

  describe('getUserList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when fails to get sql statement', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });
      sinon.stub(user_queries, 'getUserListSQL').returns(null);

      try {
        const result = users.getUserList();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('should return rows on success', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({
        rows: [
          {
            id: 1,
            user_identifier: 'identifier',
            role_ids: [1, 2],
            role_name: ['System Admin', 'Project Lead']
          }
        ]
      });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });
      sinon.stub(user_queries, 'getUserListSQL').returns(SQL`something`);

      const result = users.getUserList();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql([
        {
          id: 1,
          user_identifier: 'identifier',
          role_ids: [1, 2],
          role_name: ['System Admin', 'Project Lead']
        }
      ]);
    });
  });
});
