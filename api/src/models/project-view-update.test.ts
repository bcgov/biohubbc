import { expect } from 'chai';
import { describe } from 'mocha';
import { GetFundingData } from './project-view-update';

describe('GetFundingData', () => {
  describe('No values provided', () => {
    let fundingData: GetFundingData;

    before(() => {
      fundingData = new GetFundingData((null as unknown) as any[]);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql([]);
    });
  });

  describe('No length for funding data provided', () => {
    let fundingData: GetFundingData;

    before(() => {
      fundingData = new GetFundingData([]);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let fundingData: GetFundingData;

    const fundingDataObj = [
      {
        id: 1,
        agency_id: '1',
        agency_name: 'Agency name',
        agency_project_id: 'Agency123',
        investment_action_category: 'Investment',
        investment_action_category_name: 'Investment name',
        start_date: '01/01/2020',
        end_date: '01/01/2021',
        funding_amount: 123,
        revision_count: 0
      }
    ];

    before(() => {
      fundingData = new GetFundingData(fundingDataObj);
    });

    it('sets project funding sources', function () {
      expect(fundingData.fundingSources).to.eql(fundingDataObj);
    });
  });
});
