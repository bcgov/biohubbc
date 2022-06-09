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
      expect(data.survey_name).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(null);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyData;

    const surveyObj = {
      survey_name: 'survey name',
      end_date: '2020/04/04',
      start_date: '2020/03/03',
      biologist_first_name: 'first',
      biologist_last_name: 'last'
    };

    before(() => {
      data = new GetSurveyData(surveyObj);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyObj.survey_name);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyObj.end_date);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyObj.start_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(surveyObj.biologist_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(surveyObj.biologist_last_name);
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

    const surveyObj = [
      { id: 1, label: 'species1' },
      { id: 2, label: 'species2' }
    ];

    before(() => {
      data = new GetFocalSpeciesData(surveyObj);
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

    const surveyObj = [
      { id: 1, label: 'species1' },
      { id: 2, label: 'species2' }
    ];

    before(() => {
      data = new GetAncillarySpeciesData(surveyObj);
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
      expect(data.permit_number).to.eql(null);
    });

    it('sets ancillary_species', () => {
      expect(data.permit_type).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: GetPermitData;

    const surveyObj = {
      permit_number: '12345',
      permit_type: 'permit_type'
    };

    before(() => {
      data = new GetPermitData(surveyObj);
    });

    it('sets permit_number', () => {
      expect(data.permit_number).to.equal('12345');
    });

    it('sets permit_type', () => {
      expect(data.permit_type).to.equal('permit_type');
    });
  });
});

describe('GetSurveyFundingSources', () => {
  describe('No values provided', () => {
    let data: GetSurveyFundingSources;

    before(() => {
      data = new GetSurveyFundingSources(null);
    });

    it('sets permit_number', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyFundingSources;

    const surveyObj = {
      funding_sources: [1, 2]
    };

    before(() => {
      data = new GetSurveyFundingSources(surveyObj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([1, 2]);
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

    const surveyObj = {
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
      data = new GetSurveyProprietorData(surveyObj);
    });

    it('sets proprietor_type_name', () => {
      expect(data.proprietor_type_name).to.equal(surveyObj.proprietor_type_name);
    });

    it('sets proprietor_type_id', () => {
      expect(data.proprietor_type_id).to.equal(surveyObj.proprietor_type_id);
    });

    it('sets first_nations_id', () => {
      expect(data.first_nations_id).to.equal(surveyObj.first_nations_id);
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal(surveyObj.first_nations_name);
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal(surveyObj.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(surveyObj.proprietor_name);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(surveyObj.disa_required);
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
      expect(data.survey_area_name).to.equal(null);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql([]);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: GetSurveyLocationData;

    const surveyObj = {
      survey_area_name: 'area_name',
      geometry: [{}]
    };

    before(() => {
      data = new GetSurveyLocationData(surveyObj);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyObj.survey_area_name);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(surveyObj.geometry);
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
      expect(data.surveyed_all_areas).to.equal(null);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: GetSurveyPurposeAndMethodologyData;

    const surveyObj = {
      intended_outcome_id: 1,
      additional_details: 'additional_detail',
      field_method_id: 2,
      ecological_season_id: 3,
      vantage_code_ids: [4, 5],
      surveyed_all_areas: true
    };

    before(() => {
      data = new GetSurveyPurposeAndMethodologyData(surveyObj);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_id).to.equal(surveyObj.intended_outcome_id);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.eql(surveyObj.additional_details);
    });

    it('sets field_method_id', () => {
      expect(data.field_method_id).to.eql(surveyObj.field_method_id);
    });

    it('sets ecological_season_id', () => {
      expect(data.ecological_season_id).to.eql(surveyObj.ecological_season_id);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql(surveyObj.vantage_code_ids);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.eql(surveyObj.surveyed_all_areas);
    });
  });
});
