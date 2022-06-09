import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostAgreementsData,
  PostFundingData,
  PostLocationData,
  PostPermitData,
  PostProprietorData,
  PostPurposeAndMethodologyData,
  PostSpeciesData,
  PostSurveyDetailsData,
  PostSurveyObject
} from './survey-create';

describe('PostSurveyObject', () => {
  describe('No values provided', () => {
    let data: PostSurveyObject;

    before(() => {
      data = new PostSurveyObject(null);
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

    it('sets agreements', () => {
      expect(data.agreements).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PostSurveyObject;

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
      data = new PostSurveyObject(surveyObj);
    });

    it('sets survey_details', () => {
      expect(data.survey_details).to.be.instanceOf(PostSurveyDetailsData);
    });

    it('sets species', () => {
      expect(data.species).to.instanceOf(PostSpeciesData);
    });

    it('sets permit', () => {
      expect(data.permit).to.instanceOf(PostPermitData);
    });

    it('sets funding', () => {
      expect(data.funding).to.instanceOf(PostFundingData);
    });

    it('sets proprietor', () => {
      expect(data.proprietor).to.instanceOf(PostProprietorData);
    });

    it('sets purpose_and_methodology', () => {
      expect(data.purpose_and_methodology).to.instanceOf(PostPurposeAndMethodologyData);
    });

    it('sets location', () => {
      expect(data.location).to.instanceOf(PostLocationData);
    });

    it('sets agreements', () => {
      expect(data.agreements).to.instanceOf(PostAgreementsData);
    });
  });
});

describe('PostSurveyDetailsData', () => {
  describe('No values provided', () => {
    let data: PostSurveyDetailsData;

    before(() => {
      data = new PostSurveyDetailsData(null);
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
    let data: PostSurveyDetailsData;

    const surveyObj = {
      survey_name: 'survey name',
      end_date: '2020/04/04',
      start_date: '2020/03/03',
      biologist_first_name: 'first',
      biologist_last_name: 'last'
    };

    before(() => {
      data = new PostSurveyDetailsData(surveyObj);
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

describe('PostSpeciesData', () => {
  describe('No values provided', () => {
    let data: PostSpeciesData;

    before(() => {
      data = new PostSpeciesData(null);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PostSpeciesData;

    const surveyObj = {
      focal_species: [1, 2],
      ancillary_species: [3]
    };

    before(() => {
      data = new PostSpeciesData(surveyObj);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([1, 2]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([3]);
    });
  });
});

describe('PostPermitData', () => {
  describe('No values provided', () => {
    let data: PostPermitData;

    before(() => {
      data = new PostPermitData(null);
    });

    it('sets permit_number', () => {
      expect(data.permit_number).to.eql(null);
    });

    it('sets ancillary_species', () => {
      expect(data.permit_type).to.eql(null);
    });
  });

  describe('All values provided', () => {
    let data: PostPermitData;

    const surveyObj = {
      permit_number: '12345',
      permit_type: 'permit_type'
    };

    before(() => {
      data = new PostPermitData(surveyObj);
    });

    it('sets permit_number', () => {
      expect(data.permit_number).to.equal('12345');
    });

    it('sets permit_type', () => {
      expect(data.permit_type).to.equal('permit_type');
    });
  });
});

describe('PostFundingData', () => {
  describe('No values provided', () => {
    let data: PostFundingData;

    before(() => {
      data = new PostFundingData(null);
    });

    it('sets permit_number', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PostFundingData;

    const surveyObj = {
      funding_sources: [1, 2]
    };

    before(() => {
      data = new PostFundingData(surveyObj);
    });

    it('sets funding_sources', () => {
      expect(data.funding_sources).to.eql([1, 2]);
    });
  });
});

describe('PostProprietorData', () => {
  describe('No values provided', () => {
    let data: PostProprietorData;

    before(() => {
      data = new PostProprietorData(null);
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
    let data: PostProprietorData;

    const surveyObj = {
      proprietary_data_category: 'survey name',
      first_nations_id: '2020/04/04',
      category_rationale: '2020/03/03',
      proprietor_name: 'first',
      disa_required: 'last'
    };

    before(() => {
      data = new PostProprietorData(surveyObj);
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
    let data: PostProprietorData;

    const surveyObj = {
      proprietary_data_category: 'survey name',
      first_nations_id: null,
      category_rationale: '2020/03/03',
      proprietor_name: 'first',
      disa_required: 'last'
    };

    before(() => {
      data = new PostProprietorData(surveyObj);
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

describe('PostLocationData', () => {
  describe('No values provided', () => {
    let data: PostLocationData;

    before(() => {
      data = new PostLocationData(null);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(null);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql([]);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PostLocationData;

    const surveyObj = {
      survey_area_name: 'area_name',
      geometry: [{}]
    };

    before(() => {
      data = new PostLocationData(surveyObj);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyObj.survey_area_name);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(surveyObj.geometry);
    });
  });
});

describe('PostPurposeAndMethodologyData', () => {
  describe('No values provided', () => {
    let data: PostPurposeAndMethodologyData;

    before(() => {
      data = new PostPurposeAndMethodologyData(null);
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
    let data: PostPurposeAndMethodologyData;

    const surveyObj = {
      intended_outcome_id: 1,
      additional_details: 'additional_detail',
      field_method_id: 2,
      ecological_season_id: 3,
      vantage_code_ids: [4, 5],
      surveyed_all_areas: true
    };

    before(() => {
      data = new PostPurposeAndMethodologyData(surveyObj);
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

describe('PostAgreementsData', () => {
  describe('No values provided', () => {
    let data: PostAgreementsData;

    before(() => {
      data = new PostAgreementsData(null);
    });

    it('sets foippa_requirements_accepted', () => {
      expect(data.foippa_requirements_accepted).to.equal(false);
    });

    it('sets sedis_procedures_accepted', () => {
      expect(data.sedis_procedures_accepted).to.equal(false);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PostAgreementsData;

    const surveyObj = {
      foippa_requirements_accepted: 'true',
      sedis_procedures_accepted: 'true'
    };

    before(() => {
      data = new PostAgreementsData(surveyObj);
    });

    it('sets foippa_requirements_accepted', () => {
      expect(data.foippa_requirements_accepted).to.equal(true);
    });

    it('sets sedis_procedures_accepted', () => {
      expect(data.sedis_procedures_accepted).to.eql(false);
    });
  });
});
