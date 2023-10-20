import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_ROLE } from '../constants/roles';
import * as db from '../database/db';
import * as authorization from '../request-handlers/security/authorization';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import * as search from './search';

chai.use(sinonChai);

describe('search', () => {
  describe('getSearchResults', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return null when no response returned from getSpatialSearchResultsSQL', async () => {
      const dbConnectionObj = getMockDBConnection();

      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: [], rowCount: 0 });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        sql: mockQuery
      });
      sinon.stub(authorization, 'userHasValidRole').returns(true);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq['keycloak_token'] = {};
      mockReq['system_user'] = {
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
      };

      const result = search.getSearchResults();

      await result(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql([]);
    });

    it('should return rows on success when result is empty', async () => {
      const dbConnectionObj = getMockDBConnection();

      const mockQuery = sinon.stub();

      mockQuery.resolves({ rows: [], rowCount: 0 });

      sinon.stub(db, 'getDBConnection').returns({
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        sql: mockQuery
      });
      sinon.stub(authorization, 'userHasValidRole').returns(false);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq['keycloak_token'] = {};
      mockReq['system_user'] = {
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
      };

      const result = search.getSearchResults();

      await result(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql([]);
    });

    it('should return rows on success', async () => {
      const dbConnectionObj = getMockDBConnection();

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
        sql: mockQuery
      });
      sinon.stub(authorization, 'userHasValidRole').returns(true);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq['keycloak_token'] = {};
      mockReq['system_user'] = {
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN]
      };

      const result = search.getSearchResults();

      await result(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql([
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
