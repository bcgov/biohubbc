import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as search from './search';
import * as db from '../../database/db';
import * as search_queries from '../../queries/public/search-queries';
import SQL from 'sql-template-strings';

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

    it('should return null when no response returned from getPublicSpatialSearchResultsSQL', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: null });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });
      sinon.stub(search_queries, 'getPublicSpatialSearchResultsSQL').returns(SQL`something`);

      const result = search.getSearchResults();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.equal(null);
    });

    it('should return rows on success when result is empty', async () => {
      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: [] });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });
      sinon.stub(search_queries, 'getPublicSpatialSearchResultsSQL').returns(SQL`something`);

      const result = search.getSearchResults();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql([]);
    });

    it('should return rows on success', async () => {
      const searchList = [
        {
          id: 1,
          name: 'name',
          geometry: '{"type":"Point","coordinates":[50.7,60.9]}'
        }
      ];

      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: searchList });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });
      sinon.stub(search_queries, 'getPublicSpatialSearchResultsSQL').returns(SQL`something`);

      const result = search.getSearchResults();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult).to.eql([
        {
          id: searchList[0].id,
          name: searchList[0].name,
          geometry: [
            {
              type: 'Point',
              coordinates: [50.7, 60.9]
            }
          ]
        }
      ]);
    });
  });
});
