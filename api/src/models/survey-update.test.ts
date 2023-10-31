import { expect } from 'chai';
import { describe } from 'mocha';
import {
  PostSurveyLocationData,
  PutPartnershipsData,
  PutSurveyDetailsData,
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

    it('sets proprietor', () => {
      expect(data.proprietor).to.equal(null);
    });

    it('sets purpose_and_methodology', () => {
      expect(data.purpose_and_methodology).to.equal(null);
    });

    it('sets location', () => {
      expect(data.locations).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyObject;

    const obj = {
      survey_details: {},
      species: {},
      permit: {},
      proprietor: {},
      purpose_and_methodology: {},
      agreements: {}
    };

    before(() => {
      data = new PutSurveyObject(obj);
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

    it('sets proprietor', () => {
      expect(data.proprietor).to.instanceOf(PutSurveyProprietorData);
    });

    it('sets purpose_and_methodology', () => {
      expect(data.purpose_and_methodology).to.instanceOf(PutSurveyPurposeAndMethodologyData);
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

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyDetailsData;

    const obj = {
      survey_name: 'survey name',
      end_date: '2020/04/04',
      start_date: '2020/03/03',
      revision_count: 0
    };

    before(() => {
      data = new PutSurveyDetailsData(obj);
    });

    it('sets name', () => {
      expect(data.name).to.equal(obj.survey_name);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(obj.end_date);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(obj.start_date);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(obj.revision_count);
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

    const obj = {
      focal_species: [1, 2],
      ancillary_species: [3]
    };

    before(() => {
      data = new PutSurveySpeciesData(obj);
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

    it('sets permits', () => {
      expect(data.permits).to.eql([]);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyPermitData;

    const obj = {
      permits: [
        {
          permit_id: 1,
          permit_number: '12345',
          permit_type: 'permit_type'
        }
      ]
    };

    before(() => {
      data = new PutSurveyPermitData(obj);
    });

    it('sets permit_id', () => {
      expect(data.permits[0].permit_id).to.equal(obj.permits[0].permit_id);
    });

    it('sets permit_number', () => {
      expect(data.permits[0].permit_number).to.equal(obj.permits[0].permit_number);
    });

    it('sets permit_type', () => {
      expect(data.permits[0].permit_type).to.equal(obj.permits[0].permit_type);
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
      expect(data.disa_required).to.equal(false);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PutSurveyProprietorData;

    const obj = {
      proprietary_data_category: 'survey name',
      first_nations_id: 1,
      category_rationale: 2,
      proprietor_name: 'name',
      disa_required: 'true'
    };

    before(() => {
      data = new PutSurveyProprietorData(obj);
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
    let data: PutSurveyProprietorData;

    const obj = {
      proprietary_data_category: 'survey name',
      first_nations_id: null,
      category_rationale: 2,
      proprietor_name: 'name',
      disa_required: 'true'
    };

    before(() => {
      data = new PutSurveyProprietorData(obj);
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
      expect(data.disa_required).to.equal(true);
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

    it('sets ecological_season_id', () => {
      expect(data.ecological_season_id).to.equal(null);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql([]);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.equal(false);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PutSurveyPurposeAndMethodologyData;

    const obj = {
      intended_outcome_id: 1,
      additional_details: 'additional_detail',
      ecological_season_id: 3,
      vantage_code_ids: [4, 5],
      surveyed_all_areas: 'true',
      revision_count: 0
    };

    before(() => {
      data = new PutSurveyPurposeAndMethodologyData(obj);
    });

    it('sets intended_outcome_id', () => {
      expect(data.intended_outcome_id).to.equal(obj.intended_outcome_id);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.equal(obj.additional_details);
    });

    it('sets ecological_season_id', () => {
      expect(data.ecological_season_id).to.equal(obj.ecological_season_id);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.eql(obj.vantage_code_ids);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.equal(true);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(obj.revision_count);
    });
  });
});

describe('PutLocationData', () => {
  describe('No values provided', () => {
    let data: PostSurveyLocationData;

    before(() => {
      data = new PostSurveyLocationData(null);
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets description', () => {
      expect(data.description).to.equal('');
    });

    it('sets geojson', () => {
      expect(data.geojson).to.eql([]);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PostSurveyLocationData;

    const obj = {
      name: 'area name',
      description: 'area description',
      geojson: [{}],
      revision_count: 0
    };

    before(() => {
      data = new PostSurveyLocationData(obj);
    });

    it('sets name', () => {
      expect(data.name).to.equal(obj.name);
    });

    it('sets description', () => {
      expect(data.description).to.equal(obj.description);
    });

    it('sets geojson', () => {
      expect(data.geojson).to.eql(obj.geojson);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(obj.revision_count);
    });
  });
});

describe('PutPartnershipsData', () => {
  describe('No values provided', () => {
    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData(null);
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql([]);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql([]);
    });
  });

  describe('all values provided', () => {
    const obj = {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner 3', 'partner 4']
    };

    let data: PutPartnershipsData;

    before(() => {
      data = new PutPartnershipsData(obj);
    });

    it('sets indigenous_partnerships', () => {
      expect(data.indigenous_partnerships).to.eql(obj.indigenous_partnerships);
    });

    it('sets stakeholder_partnerships', () => {
      expect(data.stakeholder_partnerships).to.eql(obj.stakeholder_partnerships);
    });
  });
});
