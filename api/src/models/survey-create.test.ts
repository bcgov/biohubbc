import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostAgreementsData,
  PostPartnershipsData,
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

    it('sets proprietor', () => {
      expect(data.proprietor).to.equal(null);
    });

    it('sets purpose_and_methodology', () => {
      expect(data.purpose_and_methodology).to.equal(null);
    });

    it('sets locations', () => {
      expect(data.locations).to.eql([]);
    });

    it('sets agreements', () => {
      expect(data.agreements).to.equal(null);
    });

    it('sets partnerships', function () {
      expect(data.partnerships).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PostSurveyObject;

    const obj = {
      survey_details: {},
      species: {},
      permit: {},
      proprietor: {},
      purpose_and_methodology: {},
      agreements: {}
    };

    before(() => {
      data = new PostSurveyObject(obj);
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

    it('sets proprietor', () => {
      expect(data.proprietor).to.instanceOf(PostProprietorData);
    });

    it('sets purpose_and_methodology', () => {
      expect(data.purpose_and_methodology).to.instanceOf(PostPurposeAndMethodologyData);
    });

    it('sets agreements', () => {
      expect(data.agreements).to.instanceOf(PostAgreementsData);
    });
  });
});

describe('PostPartnershipsData', () => {
  describe('No values provided', () => {
    let projectPartnershipsData: PostPartnershipsData;

    before(() => {
      projectPartnershipsData = new PostPartnershipsData(null);
    });

    it('sets indigenous_partnerships', function () {
      expect(projectPartnershipsData.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', function () {
      expect(projectPartnershipsData.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let projectPartnershipsData: PostPartnershipsData;

    const obj = {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner1, partner2']
    };

    before(() => {
      projectPartnershipsData = new PostPartnershipsData(obj);
    });

    it('sets indigenous_partnerships', function () {
      expect(projectPartnershipsData.indigenous_partnerships).to.eql(obj.indigenous_partnerships);
    });

    it('sets stakeholder_partnerships', function () {
      expect(projectPartnershipsData.stakeholder_partnerships).to.eql(obj.stakeholder_partnerships);
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
  });

  describe('All values provided', () => {
    let data: PostSurveyDetailsData;

    const obj = {
      survey_name: 'survey name',
      end_date: '2020/04/04',
      start_date: '2020/03/03'
    };

    before(() => {
      data = new PostSurveyDetailsData(obj);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(obj.survey_name);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(obj.end_date);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(obj.start_date);
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

    const obj = {
      focal_species: [1, 2],
      ancillary_species: [3]
    };

    before(() => {
      data = new PostSpeciesData(obj);
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

    it('sets permits', () => {
      expect(data.permits).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PostPermitData;

    const obj = {
      permits: [
        {
          permit_number: '12345',
          permit_type: 'permit_type'
        }
      ]
    };

    before(() => {
      data = new PostPermitData(obj);
    });

    it('sets permit_number', () => {
      expect(data.permits[0].permit_number).to.equal(obj.permits[0].permit_number);
    });

    it('sets permit_type', () => {
      expect(data.permits[0].permit_type).to.equal(obj.permits[0].permit_type);
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
      expect(data.disa_required).to.equal(false);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PostProprietorData;

    const obj = {
      proprietary_data_category: 'survey name',
      first_nations_id: 1,
      category_rationale: 2,
      proprietor_name: 'name',
      disa_required: 'true'
    };

    before(() => {
      data = new PostProprietorData(obj);
    });

    it('sets prt_id', () => {
      expect(data.prt_id).to.equal(obj.proprietary_data_category);
    });

    it('sets fn_id', () => {
      expect(data.fn_id).to.equal(obj.first_nations_id);
    });

    it('sets rationale', () => {
      expect(data.rationale).to.equal(obj.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(null);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(true);
    });
  });

  describe('All values provided without first nations id', () => {
    let data: PostProprietorData;

    const obj = {
      proprietary_data_category: 'survey name',
      first_nations_id: null,
      category_rationale: 2,
      proprietor_name: 'name',
      disa_required: 'false'
    };

    before(() => {
      data = new PostProprietorData(obj);
    });

    it('sets prt_id', () => {
      expect(data.prt_id).to.equal(obj.proprietary_data_category);
    });

    it('sets fn_id', () => {
      expect(data.fn_id).to.equal(obj.first_nations_id);
    });

    it('sets rationale', () => {
      expect(data.rationale).to.equal(obj.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(obj.proprietor_name);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(false);
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
      expect(data.intended_outcome_ids).to.eql([]);
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

    const obj = {
      intended_outcome_ids: [1],
      additional_details: 'additional_detail',
      field_method_id: 2,
      ecological_season_id: 3,
      vantage_code_ids: [4, 5],
      surveyed_all_areas: true
    };

    before(() => {
      data = new PostPurposeAndMethodologyData(obj);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_ids).to.equal(obj.intended_outcome_ids);
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
      expect(data.vantage_code_ids).to.eql(obj.vantage_code_ids);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.eql(obj.surveyed_all_areas);
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

    const obj = {
      foippa_requirements_accepted: 'true',
      sedis_procedures_accepted: 'true'
    };

    before(() => {
      data = new PostAgreementsData(obj);
    });

    it('sets foippa_requirements_accepted', () => {
      expect(data.foippa_requirements_accepted).to.equal(true);
    });

    it('sets sedis_procedures_accepted', () => {
      expect(data.sedis_procedures_accepted).to.eql(true);
    });
  });
});
