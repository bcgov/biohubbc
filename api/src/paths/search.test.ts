import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as search from './search';
import * as db from '../database/db';
import * as search_queries from '../queries/search-queries';

chai.use(sinonChai);

describe('search', () => {
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
  } as any;

  describe('getSearchResults', () => {
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
      sinon.stub(search_queries, 'getSpatialSearchResultsSQL').returns(null);

      try {
        const result = search.getSearchResults();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect(actualError.status).to.equal(400);
        expect(actualError.message).to.equal('Failed to build SQL get statement');
      }
    });
  });
});
