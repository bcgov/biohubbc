import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { FundingSource, FundingSourceRepository } from '../repositories/funding-source-repository';
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

      const expectedResult = [{ funding_source_id: 1, name: 'name', description: 'description' }];

      const getFundingSourcesStub = sinon
        .stub(FundingSourceRepository.prototype, 'getFundingSources')
        .resolves(expectedResult);

      const response = await fundingSourceService.getFundingSources({ name: 'mame' });

      expect(getFundingSourcesStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('getFundingSource', () => {
    it('returns a single funding source', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = { funding_source_id: 1, name: 'name', description: 'description' };

      const getFundingSourceByIdStub = sinon
        .stub(FundingSourceRepository.prototype, 'getFundingSource')
        .resolves(expectedResult);

      const fundingSourceId = 1;

      const response = await fundingSourceService.getFundingSource(fundingSourceId);

      expect(getFundingSourceByIdStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('putFundingSource', () => {
    it('returns an array of funding source items', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = { funding_source_id: 1 };

      const putFundingSourceStub = sinon
        .stub(FundingSourceRepository.prototype, 'putFundingSource')
        .resolves(expectedResult);

      const fundingSource: FundingSource = {
        funding_source_id: 1,
        name: 'name',
        description: 'description',
        revision_count: 0
      };

      const response = await fundingSourceService.putFundingSource(fundingSource);

      expect(putFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });

  describe('deleteFundingSource', () => {
    it('deletes a funding source and returns the id of the deleted record', async () => {
      const dbConnection = getMockDBConnection();
      const fundingSourceService = new FundingSourceService(dbConnection);

      const expectedResult = { funding_source_id: 1 };

      const deleteFundingSourceStub = sinon
        .stub(FundingSourceRepository.prototype, 'deleteFundingSource')
        .resolves(expectedResult);

      const fundingSourceId = 1;

      const response = await fundingSourceService.deleteFundingSource(fundingSourceId);

      expect(deleteFundingSourceStub).to.be.calledOnce;
      expect(response).to.eql(expectedResult);
    });
  });
});
