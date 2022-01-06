import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as drafts from './drafts';
import * as db from '../database/db';
import draft_queries from '../queries/project/draft';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../__mocks__/db';
import { HTTPError } from '../errors/custom-error';

chai.use(sinonChai);

describe('drafts', () => {
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

  describe('getDraftList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no system user id', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = drafts.getDraftList();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
      }
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });
      sinon.stub(draft_queries, 'getDraftsSQL').returns(null);

      try {
        const result = drafts.getDraftList();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('should throw a 400 error when no rows in result', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rows: null
          } as any;
        }
      });

      sinon.stub(draft_queries, 'getDraftsSQL').returns(SQL`some query`);

      try {
        const result = drafts.getDraftList();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to get drafts');
      }
    });

    it('should return result on success', async () => {
      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: async () => {
          return {
            rows: [{ id: 1, name: 'draft 1' }]
          } as any;
        }
      });

      sinon.stub(draft_queries, 'getDraftsSQL').returns(SQL`some query`);

      const result = drafts.getDraftList();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult[0].id).to.equal(1);
      expect(actualResult[0].name).to.equal('draft 1');
    });
  });
});
