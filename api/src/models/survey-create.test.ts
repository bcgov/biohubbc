import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSurveyObject, PostSurveyProprietorData } from './survey-create';

describe('PostSurveyObject', () => {
  describe('No values provided', () => {
    let data: PostSurveyObject;

    before(() => {
      data = new PostSurveyObject(null);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(null);
    });

    it('sets survey_purpose', () => {
      expect(data.survey_purpose).to.equal(null);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });

    it('sets survey type', () => {
      expect(data.survey_type).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(null);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(null);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(null);
    });

    it('sets foippa_requirements_accepted', () => {
      expect(data.foippa_requirements_accepted).to.equal(false);
    });

    it('sets survey_data_proprietary', () => {
      expect(data.survey_data_proprietary).to.equal(false);
    });

    it('sets survey_proprietor', () => {
      expect(data.survey_proprietor).to.equal(undefined);
    });
  });

  describe('All values provided with survey data proprietary is false', () => {
    let data: PostSurveyObject;

    const surveyObj = {
      biologist_first_name: 'first',
      biologist_last_name: 'last',
      end_date: '2020/04/04',
      foippa_requirements_accepted: 'true',
      focal_species: [1, 2],
      ancillary_species: [3, 4],
      survey_type: 'type',
      start_date: '2020/03/03',
      survey_area_name: 'area name',
      survey_data_proprietary: 'false',
      survey_name: 'survey name',
      survey_purpose: 'purpose',
      geometry: [
        {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ],
          properties: {
            name: 'Biohub Islands'
          }
        }
      ],
      proprietary_data_category: null,
      first_nations_id: null,
      category_rationale: null,
      proprietor_name: null,
      data_sharing_agreement_required: 'false'
    };

    before(() => {
      data = new PostSurveyObject(surveyObj);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyObj.survey_name);
    });

    it('sets survey_purpose', () => {
      expect(data.survey_purpose).to.equal(surveyObj.survey_purpose);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(surveyObj.focal_species);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(surveyObj.ancillary_species);
    });

    it('sets survey_type', () => {
      expect(data.survey_type).to.eql(surveyObj.survey_type);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyObj.start_date);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyObj.end_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(surveyObj.biologist_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(surveyObj.biologist_last_name);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyObj.survey_area_name);
    });

    it('sets foippa_requirements_accepted', () => {
      expect(data.foippa_requirements_accepted).to.equal(true);
    });

    it('sets survey_data_proprietary', () => {
      expect(data.survey_data_proprietary).to.equal(false);
    });

    it('sets survey_proprietor', () => {
      expect(data.survey_proprietor).to.equal(undefined);
    });

    it('sets the geometry', () => {
      expect(data.geometry).to.eql(surveyObj.geometry);
    });
  });

  describe('All values provided with survey data proprietary is true', () => {
    let data: PostSurveyObject;

    const surveyObj = {
      biologist_first_name: 'first',
      biologist_last_name: 'last',
      end_date: '2020/04/04',
      foippa_requirements_accepted: 'true',
      focal_species: [1, 2],
      ancillary_species: [3, 4],
      survey_type: 'type',
      start_date: '2020/03/03',
      survey_area_name: 'area name',
      survey_data_proprietary: 'true',
      survey_name: 'survey name',
      survey_purpose: 'purpose',
      proprietary_data_category: 1,
      first_nations_id: null,
      category_rationale: 'rationale',
      proprietor_name: 'name',
      data_sharing_agreement_required: 'true'
    };

    before(() => {
      data = new PostSurveyObject(surveyObj);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyObj.survey_name);
    });

    it('sets survey_purpose', () => {
      expect(data.survey_purpose).to.equal(surveyObj.survey_purpose);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(surveyObj.focal_species);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(surveyObj.ancillary_species);
    });

    it('sets survey_type', () => {
      expect(data.survey_type).to.eql(surveyObj.survey_type);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyObj.start_date);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyObj.end_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(surveyObj.biologist_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(surveyObj.biologist_last_name);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyObj.survey_area_name);
    });

    it('sets foippa_requirements_accepted', () => {
      expect(data.foippa_requirements_accepted).to.equal(true);
    });

    it('sets survey_data_proprietary', () => {
      expect(data.survey_data_proprietary).to.equal(true);
    });

    it('sets survey_proprietor', () => {
      expect(data.survey_proprietor).to.eql({
        prt_id: 1,
        fn_id: null,
        rationale: 'rationale',
        proprietor_name: 'name',
        disa_required: true
      });
    });
  });
});

describe('PostSurveyProprietorData', () => {
  describe('No values provided', () => {
    let data: PostSurveyProprietorData;

    before(() => {
      data = new PostSurveyProprietorData(null);
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

  describe('All values provided with no first nations id', () => {
    let data: PostSurveyProprietorData;

    const proprietorData = {
      proprietary_data_category: 1,
      first_nations_id: null,
      category_rationale: 'rationale',
      proprietor_name: 'name',
      data_sharing_agreement_required: 'true'
    };

    before(() => {
      data = new PostSurveyProprietorData(proprietorData);
    });

    it('sets prt_id', () => {
      expect(data.prt_id).to.equal(proprietorData.proprietary_data_category);
    });

    it('sets fn_id', () => {
      expect(data.fn_id).to.equal(null);
    });

    it('sets rationale', () => {
      expect(data.rationale).to.equal(proprietorData.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(proprietorData.proprietor_name);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(true);
    });
  });

  describe('All values provided with first nations id', () => {
    let data: PostSurveyProprietorData;

    const proprietorData = {
      proprietary_data_category: 1,
      first_nations_id: 2,
      category_rationale: 'rationale',
      proprietor_name: 'name',
      data_sharing_agreement_required: 'true'
    };

    before(() => {
      data = new PostSurveyProprietorData(proprietorData);
    });

    it('sets prt_id', () => {
      expect(data.prt_id).to.equal(proprietorData.proprietary_data_category);
    });

    it('sets fn_id', () => {
      expect(data.fn_id).to.equal(proprietorData.first_nations_id);
    });

    it('sets rationale', () => {
      expect(data.rationale).to.equal(proprietorData.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(null);
    });

    it('sets disa_required', () => {
      expect(data.disa_required).to.equal(true);
    });
  });
});
