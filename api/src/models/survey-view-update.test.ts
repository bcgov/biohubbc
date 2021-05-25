import { expect } from 'chai';
import { describe } from 'mocha';
import { GetSurveyDetailsData, GetSurveyProprietorData } from './survey-view-update';

describe('GetSurveyDetailsData', () => {
  describe('No values provided', () => {
    let data: GetSurveyDetailsData;

    before(() => {
      data = new GetSurveyDetailsData(null);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal('');
    });

    it('sets survey_purpose', () => {
      expect(data.survey_purpose).to.equal('');
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal('');
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal('');
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal('');
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal('');
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal('');
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('all values provided with species as strings', () => {
    let data: GetSurveyDetailsData;

    const surveyData = [
      {
        id: 1,
        name: 'survey name',
        objectives: 'purpose of survey',
        start_date: '2020-04-20T07:00:00.000Z',
        end_date: '2020-05-20T07:00:00.000Z',
        revision_count: 1,
        focal_species: 'species',
        ancillary_species: 'ancillary',
        lead_first_name: 'lead',
        lead_last_name: 'last',
        location_name: 'area',
        geometry:
          '{"type":"Polygon","coordinates":[[[-128.224277,53.338275],[-128.224277,58.201367],[-124.122791,58.201367],[-124.122791,53.338275],[-128.224277,53.338275]]]}'
      }
    ];

    before(() => {
      data = new GetSurveyDetailsData(surveyData);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyData[0].name);
    });

    it('sets survey_purpose', () => {
      expect(data.survey_purpose).to.equal(surveyData[0].objectives);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([surveyData[0].focal_species]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([surveyData[0].ancillary_species]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyData[0].start_date);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyData[0].end_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(surveyData[0].lead_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(surveyData[0].lead_last_name);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyData[0].location_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyData[0].revision_count);
    });

    it('sets the geometry', () => {
      expect(data.geometry).to.eql([JSON.parse(surveyData[0].geometry)]);
    });
  });

  describe('all values provided with species as strings', () => {
    let data: GetSurveyDetailsData;

    const surveyData = [
      {
        id: 1,
        name: 'survey name',
        objectives: 'purpose of survey',
        start_date: '2020-04-20T07:00:00.000Z',
        end_date: '2020-05-20T07:00:00.000Z',
        revision_count: 1,
        focal_species: 1,
        ancillary_species: 2,
        lead_first_name: 'lead',
        lead_last_name: 'last',
        location_name: 'area',
        geometry:
          '{"type":"Polygon","coordinates":[[[-128.224277,53.338275],[-128.224277,58.201367],[-124.122791,58.201367],[-124.122791,53.338275],[-128.224277,53.338275]]]}'
      }
    ];

    before(() => {
      data = new GetSurveyDetailsData(surveyData);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyData[0].name);
    });

    it('sets survey_purpose', () => {
      expect(data.survey_purpose).to.equal(surveyData[0].objectives);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([surveyData[0].focal_species]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([surveyData[0].ancillary_species]);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyData[0].start_date);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyData[0].end_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(surveyData[0].lead_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(surveyData[0].lead_last_name);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyData[0].location_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyData[0].revision_count);
    });

    it('sets the geometry', () => {
      expect(data.geometry).to.eql([JSON.parse(surveyData[0].geometry)]);
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
      expect(data.proprietary_data_category_name).to.equal('');
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal('');
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal('');
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal('');
    });

    it('sets data_sharing_agreement_required', () => {
      expect(data.data_sharing_agreement_required).to.equal('false');
    });
  });

  describe('All values provided', () => {
    let data: GetSurveyProprietorData;

    const proprietorData = {
      proprietor_type_name: 'type',
      first_nations_name: 'fn name',
      category_rationale: 'rationale',
      proprietor_name: 'name',
      disa_required: true
    };

    before(() => {
      data = new GetSurveyProprietorData(proprietorData);
    });

    it('sets proprietary_data_category_name', () => {
      expect(data.proprietary_data_category_name).to.equal(proprietorData.proprietor_type_name);
    });

    it('sets first_nations_name', () => {
      expect(data.first_nations_name).to.equal(proprietorData.first_nations_name);
    });

    it('sets category_rationale', () => {
      expect(data.category_rationale).to.equal(proprietorData.category_rationale);
    });

    it('sets proprietor_name', () => {
      expect(data.proprietor_name).to.equal(proprietorData.proprietor_name);
    });

    it('sets data_sharing_agreement_required', () => {
      expect(data.data_sharing_agreement_required).to.equal('true');
    });
  });
});
