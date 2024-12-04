import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { VantageMode, VantageModeRepository } from './vantage-mode-repository'; // Adjust paths as necessary

chai.use(sinonChai);

describe('VantageModeRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getVantageModesByMethodLookupIds', () => {
    it('should successfully return vantage modes for provided method lookup ids', async () => {
      const mockVantageMode: VantageMode = {
        vantage_mode_id: 1,
        vantage_id: 101,
        name: 'Mode A',
        description: 'Description for mode A'
      };

      const mockResponse = {
        rows: [mockVantageMode],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repository = new VantageModeRepository(dbConnection);
      const methodLookupIds = [1, 2, 3];

      const response = await repository.getVantageModesByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([mockVantageMode]);
    });

    it('should return an empty array if no vantage modes are found for provided method lookup ids', async () => {
      const mockResponse = {
        rows: [],
        rowCount: 0
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repository = new VantageModeRepository(dbConnection);
      const methodLookupIds = [10, 20, 30];

      const response = await repository.getVantageModesByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([]);
    });
  });
});
