import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiGeneralError } from '../errors/api-error';
import { VantageModeRepository } from '../repositories/vantage-mode-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { VantageModeService } from './vantage-mode-service';

chai.use(sinonChai);

describe('VantageModeService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getVantageModesByMethodLookupIds', () => {
    it('should run successfully and return vantage modes for the provided method lookup ids', async () => {
      const mockVantageMode = {
        vantage_mode_id: 1,
        vantage_id: 101,
        name: 'Mode A',
        description: 'Description for Mode A'
      };

      sinon.stub(VantageModeRepository.prototype, 'getVantageModesByMethodLookupIds').resolves([mockVantageMode]);

      const dbConnection = getMockDBConnection();
      const service = new VantageModeService(dbConnection);

      const methodLookupIds = [1, 2, 3];
      const response = await service.getVantageModesByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([mockVantageMode]);
    });

    it('should return an empty array when no vantage modes are found for the provided method lookup ids', async () => {
      sinon.stub(VantageModeRepository.prototype, 'getVantageModesByMethodLookupIds').resolves([]);

      const dbConnection = getMockDBConnection();
      const service = new VantageModeService(dbConnection);

      const methodLookupIds = [10, 20, 30];
      const response = await service.getVantageModesByMethodLookupIds(methodLookupIds);

      expect(response).to.eql([]);
    });

    it('should handle errors gracefully when repository method fails', async () => {
      sinon.stub(VantageModeRepository.prototype, 'getVantageModesByMethodLookupIds').rejects(new Error('Query error'));

      const dbConnection = getMockDBConnection();
      const service = new VantageModeService(dbConnection);

      try {
        await service.getVantageModesByMethodLookupIds([1, 2, 3]);
        expect.fail('Expected method to throw an error');
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal('Query error');
      }
    });
  });
});
