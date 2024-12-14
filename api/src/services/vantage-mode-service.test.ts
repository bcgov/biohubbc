import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiGeneralError } from '../errors/api-error';
import { VantageReferenceRecord, VantageRepository } from '../repositories/vantage-mode-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { VantageService } from './vantage-mode-service';

chai.use(sinonChai);

describe('VantageService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getVantageReferenceRecordsByMethodLookupIds', () => {
    it('should run successfully and return vantages for the provided method lookup ids', async () => {
      const mockVantage: VantageReferenceRecord = {
        vantage_category_id: 101,
        name: 'Vantage A',
        description: 'Description for vantage A',
        vantages: [{ vantage_method_id: 1, name: 'Mode A', description: 'Description' }]
      };

      sinon.stub(VantageRepository.prototype, 'getVantageReferenceRecordsByMethodLookupIds').resolves([mockVantage]);

      const dbConnection = getMockDBConnection();
      const service = new VantageService(dbConnection);

      const methodLookupIds = [1, 2, 3];
      const response = await service.getVantageReferenceRecordsByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([mockVantage]);
    });

    it('should return an empty array when no vantages are found for the provided method lookup ids', async () => {
      sinon.stub(VantageRepository.prototype, 'getVantageReferenceRecordsByMethodLookupIds').resolves([]);

      const dbConnection = getMockDBConnection();
      const service = new VantageService(dbConnection);

      const methodLookupIds = [10, 20, 30];
      const response = await service.getVantageReferenceRecordsByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([]);
    });

    it('should handle errors gracefully when repository method fails', async () => {
      sinon
        .stub(VantageRepository.prototype, 'getVantageReferenceRecordsByMethodLookupIds')
        .rejects(new Error('Query error'));

      const dbConnection = getMockDBConnection();
      const service = new VantageService(dbConnection);

      try {
        await service.getVantageReferenceRecordsByMethodLookupIds([1, 2, 3]);
        expect.fail('Expected method to throw an error');
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Query error');
      }
    });
  });
});
