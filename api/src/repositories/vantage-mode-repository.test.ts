import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { VantageReferenceRecord, VantageRepository } from './vantage-mode-repository';

chai.use(sinonChai);

describe('VantageRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getVantagesByMethodLookupIds', () => {
    it('should successfully return vantages for provided method lookup ids', async () => {
      const mockVantage: VantageReferenceRecord = {
        vantage_category_id: 101,
        name: 'Vantage A',
        description: 'Description for vantage A',
        vantages: [{ vantage_method_id: 1, name: 'Mode A', description: 'Description' }]
      };

      const mockResponse = {
        rows: [mockVantage],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repository = new VantageRepository(dbConnection);
      const methodLookupIds = [1, 2, 3];

      const response = await repository.getVantageReferenceRecordsByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([mockVantage]);
    });

    it('should return an empty array if no vantages are found for provided method lookup ids', async () => {
      const mockResponse = {
        rows: [],
        rowCount: 0
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repository = new VantageRepository(dbConnection);
      const methodLookupIds = [10, 20, 30];

      const response = await repository.getVantageReferenceRecordsByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([]);
    });
  });
});
