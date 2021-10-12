import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as search from './search';
import * as db from '../../database/db';
import * as search_queries from '../../queries/public/search-queries';
import { getMockDBConnection } from '../../__mocks__/db';

chai.use(sinonChai);

describe('search', () => {
  const dbConnectionObj = getMockDBConnection();

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
      sinon.stub(search_queries, 'getPublicSpatialSearchResultsSQL').returns(null);

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
