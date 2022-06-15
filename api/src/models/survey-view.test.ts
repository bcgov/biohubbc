import { expect } from 'chai';
import { describe } from 'mocha';
import {
  GetAncillarySpeciesData,
  GetFocalSpeciesData,
  GetPermitData,
  GetSurveyData,
  GetSurveyFundingSources,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData
} from './survey-view';

describe('GetSurveyData', () => {
  describe('No values provided', () => {
    let data: GetSurveyData;

    before(() => {
      data = new GetSurveyData(null);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal('');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal('');
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal('');
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyData;

    const obj = {
      name: 'survey name',
      end_date: '2020/04/04',
      start_date: '2020/03/03',
      lead_first_name: 'first',
      lead_last_name: 'last'
    };

    before(() => {
      data = new GetSurveyData(obj);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(obj.name);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(obj.end_date);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(obj.start_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(obj.lead_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(obj.lead_last_name);
    });
  });
});

describe('GetFocalSpeciesData', () => {
  describe('No values provided', () => {
    let data: GetFocalSpeciesData;

    before(() => {
      data = new GetFocalSpeciesData([]);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets focal_species_names', () => {
      expect(data.focal_species_names).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetFocalSpeciesData;

    const obj = [
      { id: 1, label: 'species1' },
      { id: 2, label: 'species2' }
    ];

    before(() => {
      data = new GetFocalSpeciesData(obj);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([1, 2]);
    });

    it('sets focal_species_names', () => {
      expect(data.focal_species_names).to.eql(['species1', 'species2']);
    });
  });
});

describe('GetAncillarySpeciesData', () => {
  describe('No values provided', () => {
    let data: GetAncillarySpeciesData;

    before(() => {
      data = new GetAncillarySpeciesData([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });

    it('sets ancillary_species_names', () => {
      expect(data.ancillary_species_names).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetAncillarySpeciesData;

    const obj = [
      { id: 1, label: 'species1' },
      { id: 2, label: 'species2' }
    ];

    before(() => {
      data = new GetAncillarySpeciesData(obj);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([1, 2]);
    });

    it('sets ancillary_species_names', () => {
      expect(data.ancillary_species_names).to.eql(['species1', 'species2']);
    });
  });
});

describe('GetPermitData', () => {
  describe('No values provided', () => {
    let data: GetPermitData;

    before(() => {
      data = new GetPermitData(null);
    });

    it('sets permit_number', () => {
      expect(data.permit_number).to.equal('');
    });

    it('sets ancillary_species', () => {
      expect(data.permit_type).to.equal('');
    });
  });

  describe('All values provided', () => {
    let data: GetPermitData;

    const obj = {
      number: '12345',
      type: 'permit_type'
    };

    before(() => {
      data = new GetPermitData(obj);
    });

    it('sets permit_number', () => {
      expect(data.permit_number).to.equal(obj.number);
    });

    it('sets permit_type', () => {
      expect(data.permit_type).to.equal(obj.type);
    });
  });
});

describe('GetSurveyFundingSources', () => {
  describe('No values provided', () => {
    let data: GetSurveyFundingSources;

    before(() => {
      data = new GetSurveyFundingSources([]);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyFundingSources;

    const obj = [
      {
        project_funding_source_id: 1,
        funding_amount: 2,
        funding_source_id: 3,
        funding_start_date: '2020/04/04',
        funding_end_date: '2020/04/05',
        investment_action_category_id: 4,
        investment_action_category_name: 'name11',
        agency_name: 'name1',
        funding_source_project_id: '5'
      },
      {
        project_funding_source_id: 6,
        funding_amount: 7,
        funding_source_id: 8,
        funding_start_date: '2020/04/06',
        funding_end_date: '2020/04/07',
        investment_action_category_id: 9,
        investment_action_category_name: 'name22',
        agency_name: 'name2',
        funding_source_project_id: '10'
      }
    ];

    before(() => {
      data = new GetSurveyFundingSources(obj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([
        {
          pfs_id: 1,
          funding_amount: 2,
          funding_source_id: 3,
          funding_start_date: '2020/04/04',
          funding_end_date: '2020/04/05',
          investment_action_category_id: 4,
          investment_action_category_name: 'name11',
          agency_name: 'name1',
          funding_source_project_id: '5'
        },
        {
          pfs_id: 6,
          funding_amount: 7,
          funding_source_id: 8,
          funding_start_date: '2020/04/06',
          funding_end_date: '2020/04/07',
          investment_action_category_id: 9,
          investment_action_category_name: 'name22',
          agency_name: 'name2',
          funding_source_project_id: '10'
        }
      ]);
    });
  });
});

describe('GetSurveyProprietorData', () => {
  describe('No values provided', () => {
    let data: GetSurveyProprietorData;

    before(() => {
      data = new GetSurveyProprietorData(null);
    });

    it('sets proprietor_type_name', () => {
      expect(data.proprietor_type_name).to.equal(null);
    });

    it('sets proprietor_type_id', () => {
      expect(data.proprietor_type_id).to.equal(null);
    });

    it('sets first_nations_id', () => {
      expect(data.first_nations_id).to.equal(null);
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal(null);
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal(null);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(null);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(false);
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyProprietorData;

    const obj = {
      proprietor_type_name: 'proprietor_type_name',
      proprietor_type_id: 1,
      proprietary_data_category: 'survey name',
      first_nations_id: '2020/04/04',
      first_nations_name: 'first_nations_name',
      category_rationale: '2020/03/03',
      proprietor_name: 'proprietor_name',
      disa_required: true
    };

    before(() => {
      data = new GetSurveyProprietorData(obj);
    });

    it('sets proprietor_type_name', () => {
      expect(data.proprietor_type_name).to.equal(obj.proprietor_type_name);
    });

    it('sets proprietor_type_id', () => {
      expect(data.proprietor_type_id).to.equal(obj.proprietor_type_id);
    });

    it('sets first_nations_id', () => {
      expect(data.first_nations_id).to.equal(obj.first_nations_id);
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal(obj.first_nations_name);
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal(obj.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(obj.proprietor_name);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(obj.disa_required);
    });
  });
});

describe('GetSurveyLocationData', () => {
  describe('No values provided', () => {
    let data: GetSurveyLocationData;

    before(() => {
      data = new GetSurveyLocationData(null);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal('');
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql([]);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: GetSurveyLocationData;

    const obj = {
      location_name: 'area_name',
      geojson: [{}]
    };

    before(() => {
      data = new GetSurveyLocationData(obj);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(obj.location_name);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(obj.geojson);
    });
  });
});

describe('GetSurveyPurposeAndMethodologyData', () => {
  describe('No values provided', () => {
    let data: GetSurveyPurposeAndMethodologyData;

    before(() => {
      data = new GetSurveyPurposeAndMethodologyData(null);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_id).to.equal(null);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.equal(null);
    });

    it('sets field_method_id', () => {
      expect(data.field_method_id).to.equal(null);
    });

    it('sets ecological_season_id', () => {
      expect(data.ecological_season_id).to.equal(null);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql([]);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.equal('false');
    });
  });

  describe('All values provided with first nations id', () => {
    let data: GetSurveyPurposeAndMethodologyData;

    const obj = {
      intended_outcome_id: 1,
      additional_details: 'additional_detail',
      field_method_id: 2,
      ecological_season_id: 3,
      vantage_ids: [4, 5],
      surveyed_all_areas: true
    };

    before(() => {
      data = new GetSurveyPurposeAndMethodologyData(obj);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_id).to.equal(obj.intended_outcome_id);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.eql(obj.additional_details);
    });

    it('sets field_method_id', () => {
      expect(data.field_method_id).to.eql(obj.field_method_id);
    });

    it('sets ecological_season_id', () => {
      expect(data.ecological_season_id).to.eql(obj.ecological_season_id);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql(obj.vantage_ids);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.eql('true');
    });
  });
});
