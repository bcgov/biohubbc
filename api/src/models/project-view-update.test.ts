import { expect } from 'chai';
import { describe } from 'mocha';
import { GetSpeciesData, GetFundingData } from './project-view-update';

describe('GetSpeciesData', () => {
  describe('No values provided', () => {
    let data: GetSpeciesData;

    before(() => {
      data = new GetSpeciesData([], []);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });
  });

  describe('Values provided but not valid arrays', () => {
    let data: GetSpeciesData;

    before(() => {
      data = new GetSpeciesData((null as unknown) as any[], (null as unknown) as any[]);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });
  });

  describe('all values provided', () => {
    let data: GetSpeciesData;

    before(() => {
      data = new GetSpeciesData(
        [{ name: 'species 1' }, { name: 'species 2' }],
        [{ name: 'species 3' }, { name: 'species 4' }]
      );
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(['species 1', 'species 2']);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(['species 3', 'species 4']);
    });
  });
});

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
