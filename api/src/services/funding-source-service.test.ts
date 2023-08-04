import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { FundingSourceRepository } from '../repositories/funding-source-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { FundingSourceService } from './funding-source-service';

chai.use(sinonChai);

describe('FundingSourceService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getFundingSources', () => {
    it('returns an array of funding source items', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const mockFundingSources = [{ funding_source_id: 1, name: 'name', description: 'description' }];

      const getFundingSourcesStub = sinon
        .stub(FundingSourceRepository.prototype, 'getFundingSources')
        .resolves(mockFundingSources);

      const response = await fundingSourceService.getFundingSources();

      expect(getFundingSourcesStub).to.be.calledOnce;
      expect(response).to.eql(mockFundingSources);
    });
  });
});
