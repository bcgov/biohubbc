import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PutSurveyDetailsData,
  PutSurveyFundingData,
  PutSurveyLocationData,
  PutSurveyObject,
  PutSurveyPermitData,
  PutSurveyProprietorData,
  PutSurveyPurposeAndMethodologyData,
  PutSurveySpeciesData
} from './survey-update';

describe('PutSurveyObject', () => {
  describe('No values provided', () => {
    let data: PutSurveyObject;

    before(() => {
      data = new PutSurveyObject(null);
    });

    it('sets survey_details', () => {
      expect(data.survey_details).to.equal(null);
    });

    it('sets species', () => {
      expect(data.species).to.equal(null);
    });

    it('sets permit', () => {
      expect(data.permit).to.equal(null);
    });

    it('sets funding', () => {
      expect(data.funding).to.equal(null);
    });

    it('sets proprietor', () => {
      expect(data.proprietor).to.equal(null);
    });

    it('sets purpose_and_methodology', () => {
      expect(data.purpose_and_methodology).to.equal(null);
    });

    it('sets location', () => {
      expect(data.location).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyObject;

    const surveyObj = {
      survey_details: {},
      species: {},
      permit: {},
      funding: {},
      proprietor: {},
      purpose_and_methodology: {},
      location: {},
      agreements: {}
    };

    before(() => {
      data = new PutSurveyObject(surveyObj);
    });

    it('sets survey_details', () => {
      expect(data.survey_details).to.be.instanceOf(PutSurveyDetailsData);
    });

    it('sets species', () => {
      expect(data.species).to.instanceOf(PutSurveySpeciesData);
    });

    it('sets permit', () => {
      expect(data.permit).to.instanceOf(PutSurveyPermitData);
    });

    it('sets funding', () => {
      expect(data.funding).to.instanceOf(PutSurveyFundingData);
    });

    it('sets proprietor', () => {
      expect(data.proprietor).to.instanceOf(PutSurveyProprietorData);
    });

    it('sets purpose_and_methodology', () => {
      expect(data.purpose_and_methodology).to.instanceOf(PutSurveyPurposeAndMethodologyData);
    });

    it('sets location', () => {
      expect(data.location).to.instanceOf(PutSurveyLocationData);
    });
  });
});

describe('PutSurveyDetailsData', () => {
  describe('No values provided', () => {
    let data: PutSurveyDetailsData;

    before(() => {
      data = new PutSurveyDetailsData(null);
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets lead_first_name', () => {
      expect(data.lead_first_name).to.equal(null);
    });

    it('sets lead_last_name', () => {
      expect(data.lead_last_name).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyDetailsData;

    const surveyObj = {
      survey_name: 'survey name',
      end_date: '2020/04/04',
      start_date: '2020/03/03',
      biologist_first_name: 'first',
      biologist_last_name: 'last',
      revision_count: 0
    };

    before(() => {
      data = new PutSurveyDetailsData(surveyObj);
    });

    it('sets name', () => {
      expect(data.name).to.equal(surveyObj.survey_name);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyObj.end_date);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyObj.start_date);
    });

    it('sets lead_first_name', () => {
      expect(data.lead_first_name).to.equal(surveyObj.biologist_first_name);
    });

    it('sets lead_last_name', () => {
      expect(data.lead_last_name).to.equal(surveyObj.biologist_last_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyObj.revision_count);
    });
  });
});

describe('PutSpeciesData', () => {
  describe('No values provided', () => {
    let data: PutSurveySpeciesData;

    before(() => {
      data = new PutSurveySpeciesData(null);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveySpeciesData;

    const surveyObj = {
      focal_species: [1, 2],
      ancillary_species: [3]
    };

    before(() => {
      data = new PutSurveySpeciesData(surveyObj);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([1, 2]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([3]);
    });
  });
});

describe('PutPermitData', () => {
  describe('No values provided', () => {
    let data: PutSurveyPermitData;

    before(() => {
      data = new PutSurveyPermitData(null);
    });

    it('sets permit_number', () => {
      expect(data.permit_number).to.eql(null);
    });

    it('sets ancillary_species', () => {
      expect(data.permit_type).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyPermitData;

    const surveyObj = {
      permit_number: '12345',
      permit_type: 'permit_type'
    };

    before(() => {
      data = new PutSurveyPermitData(surveyObj);
    });

    it('sets permit_number', () => {
      expect(data.permit_number).to.equal('12345');
    });

    it('sets permit_type', () => {
      expect(data.permit_type).to.equal('permit_type');
    });
  });
});

describe('PutFundingData', () => {
  describe('No values provided', () => {
    let data: PutSurveyFundingData;

    before(() => {
      data = new PutSurveyFundingData(null);
    });

    it('sets permit_number', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyFundingData;

    const surveyObj = {
      funding_sources: [1, 2]
    };

    before(() => {
      data = new PutSurveyFundingData(surveyObj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([1, 2]);
    });
  });
});

describe('PutProprietorData', () => {
  describe('No values provided', () => {
    let data: PutSurveyProprietorData;

    before(() => {
      data = new PutSurveyProprietorData(null);
    });

    it('sets prt_id', () => {
      expect(data.prt_id).to.equal(null);
    });

    it('sets fn_id', () => {
      expect(data.fn_id).to.equal(null);
    });

    it('sets rationale', () => {
      expect(data.rationale).to.equal(null);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(null);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(null);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PutSurveyProprietorData;

    const surveyObj = {
      proprietary_data_category: 'survey name',
      first_nations_id: '2020/04/04',
      category_rationale: '2020/03/03',
      proprietor_name: 'first',
      disa_required: 'last'
    };

    before(() => {
      data = new PutSurveyProprietorData(surveyObj);
    });

    it('sets prt_id', () => {
      expect(data.prt_id).to.equal(surveyObj.proprietary_data_category);
    });

    it('sets fn_id', () => {
      expect(data.fn_id).to.equal(surveyObj.first_nations_id);
    });

    it('sets rationale', () => {
      expect(data.rationale).to.equal(surveyObj.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(surveyObj.first_nations_id);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(surveyObj.disa_required);
    });
  });

  describe('All values provided without first nations id', () => {
    let data: PutSurveyProprietorData;

    const surveyObj = {
      proprietary_data_category: 'survey name',
      first_nations_id: null,
      category_rationale: '2020/03/03',
      proprietor_name: 'first',
      disa_required: 'last'
    };

    before(() => {
      data = new PutSurveyProprietorData(surveyObj);
    });

    it('sets prt_id', () => {
      expect(data.prt_id).to.equal(surveyObj.proprietary_data_category);
    });

    it('sets fn_id', () => {
      expect(data.fn_id).to.equal(surveyObj.first_nations_id);
    });

    it('sets rationale', () => {
      expect(data.rationale).to.equal(surveyObj.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(surveyObj.proprietor_name);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(surveyObj.disa_required);
    });
  });
});

describe('PutPurposeAndMethodologyData', () => {
  describe('No values provided', () => {
    let data: PutSurveyPurposeAndMethodologyData;

    before(() => {
      data = new PutSurveyPurposeAndMethodologyData(null);
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

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PutSurveyPurposeAndMethodologyData;

    const surveyObj = {
      intended_outcome_id: 1,
      additional_details: 'additional_detail',
      field_method_id: 2,
      ecological_season_id: 3,
      vantage_code_ids: [4, 5],
      surveyed_all_areas: true,
      revision_count: 0
    };

    before(() => {
      data = new PutSurveyPurposeAndMethodologyData(surveyObj);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_id).to.equal(surveyObj.intended_outcome_id);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.equal(surveyObj.additional_details);
    });

    it('sets field_method_id', () => {
      expect(data.field_method_id).to.equal(surveyObj.field_method_id);
    });

    it('sets ecological_season_id', () => {
      expect(data.ecological_season_id).to.equal(surveyObj.ecological_season_id);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql(surveyObj.vantage_code_ids);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.equal(surveyObj.surveyed_all_areas);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyObj.revision_count);
    });
  });
});

describe('PutLocationData', () => {
  describe('No values provided', () => {
    let data: PutSurveyLocationData;

    before(() => {
      data = new PutSurveyLocationData(null);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(null);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql([]);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PutSurveyLocationData;

    const surveyObj = {
      survey_area_name: 'area_name',
      geometry: [{}],
      revision_count: 0
    };

    before(() => {
      data = new PutSurveyLocationData(surveyObj);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyObj.survey_area_name);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(surveyObj.geometry);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyObj.revision_count);
    });
  });
});
