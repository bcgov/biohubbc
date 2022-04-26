import { expect } from 'chai';
import { describe } from 'mocha';
import { GetUpdateSurveyDetailsData, PutSurveyDetailsData, PutSurveyPurposeAndMethodologyData } from './survey-update';

describe('GetUpdateSurveyDetailsData', () => {
  describe('No values provided', () => {
    let data: GetUpdateSurveyDetailsData;

    before(() => {
      data = new GetUpdateSurveyDetailsData(null);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal('');
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

    it('sets permit number', () => {
      expect(data.permit_number).to.equal('');
    });

    it('sets permit type', () => {
      expect(data.permit_type).to.equal('');
    });

    it('sets funding sources', () => {
      expect(data.funding_sources).to.eql([]);
    });
  });

  describe('all values provided with species as strings', () => {
    let data: GetUpdateSurveyDetailsData;

    const surveyData = {
      id: 1,
      name: 'survey name',
      objectives: 'purpose of survey',
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1,
      focal_species: ['species'],
      ancillary_species: ['ancillary'],
      common_survey_methodology_id: 1,
      lead_first_name: 'lead',
      lead_last_name: 'last',
      location_name: 'area',
      type: 'scientific',
      number: '123',
      pfs_id: [1],
      geometry: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [125.6, 10.1]
          },
          properties: {
            name: 'Dinagat Islands'
          }
        }
      ]
    };
    before(() => {
      data = new GetUpdateSurveyDetailsData(surveyData);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyData.name);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(surveyData.focal_species);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(surveyData.ancillary_species);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyData.start_date);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyData.end_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(surveyData.lead_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(surveyData.lead_last_name);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyData.location_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyData.revision_count);
    });

    it('sets the geometry', () => {
      expect(data.geometry).to.eql(surveyData.geometry);
    });

    it('sets permit number', () => {
      expect(data.permit_number).to.equal(surveyData.number);
    });

    it('sets permit type', () => {
      expect(data.permit_type).to.equal(surveyData.type);
    });

    it('sets funding sources', () => {
      expect(data.funding_sources).to.eql(surveyData.pfs_id);
    });
  });

  describe('all values provided with species as numbers', () => {
    let data: GetUpdateSurveyDetailsData;

    const surveyData = {
      id: 1,
      name: 'survey name',
      objectives: 'purpose of survey',
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1,
      focal_species: [1],
      ancillary_species: [2],
      common_survey_methodology_id: 1,
      lead_first_name: 'lead',
      lead_last_name: 'last',
      location_name: 'area',
      type: 'scientific',
      number: '123',
      pfs_id: [1],
      geometry: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [125.6, 10.1]
          },
          properties: {
            name: 'Dinagat Islands'
          }
        }
      ]
    };
    before(() => {
      data = new GetUpdateSurveyDetailsData(surveyData);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyData.name);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(surveyData.focal_species);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(surveyData.ancillary_species);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyData.start_date);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyData.end_date);
    });

    it('sets biologist_first_name', () => {
      expect(data.biologist_first_name).to.equal(surveyData.lead_first_name);
    });

    it('sets biologist_last_name', () => {
      expect(data.biologist_last_name).to.equal(surveyData.lead_last_name);
    });

    it('sets survey_area_name', () => {
      expect(data.survey_area_name).to.equal(surveyData.location_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyData.revision_count);
    });

    it('sets the geometry', () => {
      expect(data.geometry).to.eql(surveyData.geometry);
    });

    it('sets permit number', () => {
      expect(data.permit_number).to.equal(surveyData.number);
    });

    it('sets permit type', () => {
      expect(data.permit_type).to.equal(surveyData.type);
    });

    it('sets funding sources', () => {
      expect(data.funding_sources).to.eql(surveyData.pfs_id);
    });
  });
});

describe('PutSurveyData', () => {
  describe('No values provided', () => {
    let data: PutSurveyDetailsData;

    before(() => {
      data = new PutSurveyDetailsData(null);
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql([]);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql([]);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.equal(null);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(null);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(null);
    });

    it('sets lead_first_name', () => {
      expect(data.lead_first_name).to.equal(null);
    });

    it('sets lead_last_name', () => {
      expect(data.lead_last_name).to.equal(null);
    });

    it('sets location_name', () => {
      expect(data.location_name).to.equal(null);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(null);
    });
  });

  describe('All values provided', () => {
    let data: PutSurveyDetailsData;

    const surveyData = {
      survey_details: {
        survey_name: 'survey name',
        survey_purpose: 'survey purpose',
        focal_species: [1, 2],
        ancillary_species: [3, 4],
        common_survey_methodology_id: 1,
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        biologist_first_name: 'first',
        biologist_last_name: 'last',
        survey_area_name: 'survey area name',
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
        revision_count: 1
      }
    };

    before(() => {
      data = new PutSurveyDetailsData(surveyData);
    });

    it('sets name', () => {
      expect(data.name).to.equal(surveyData.survey_details.survey_name);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(surveyData.survey_details.focal_species);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(surveyData.survey_details.ancillary_species);
    });

    it('sets start_date', () => {
      expect(data.start_date).to.equal(surveyData.survey_details.start_date);
    });

    it('sets end_date', () => {
      expect(data.end_date).to.equal(surveyData.survey_details.end_date);
    });

    it('sets lead_first_name', () => {
      expect(data.lead_first_name).to.equal(surveyData.survey_details.biologist_first_name);
    });

    it('sets lead_last_name', () => {
      expect(data.lead_last_name).to.equal(surveyData.survey_details.biologist_last_name);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(surveyData.survey_details.geometry);
    });

    it('sets location_name', () => {
      expect(data.location_name).to.equal(surveyData.survey_details.survey_area_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyData.survey_details.revision_count);
    });
  });
});

describe('PutSurveyPurposeAndMethodologyData', () => {
  describe('No values provided', () => {
    let data: PutSurveyPurposeAndMethodologyData;

    before(() => {
      data = new PutSurveyPurposeAndMethodologyData(null);
    });

    it('sets id', () => {
      expect(data.id).to.equal(null);
    });

    it('sets intended_outcomes_id', () => {
      expect(data.intended_outcome_id).to.eql(null);
    });

    it('sets field_method_id', () => {
      expect(data.field_method_id).to.eql(null);
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

  describe('All values provided', () => {
    let data: PutSurveyPurposeAndMethodologyData;

    const purposeAndMethodologyData = {
      id: 1,
      field_method_id: 1,
      additional_details: 'additional details',
      vantage_code_ids: [1, 2],
      ecological_season_id: 1,
      intended_outcome_id: 1,
      surveyed_all_areas: 'true',
      revision_count: 1
    };

    before(() => {
      data = new PutSurveyPurposeAndMethodologyData(purposeAndMethodologyData);
    });

    it('sets id', () => {
      expect(data.id).to.equal(purposeAndMethodologyData.id);
    });

    it('sets intended_outcomes_id', () => {
      expect(data.intended_outcome_id).to.eql(purposeAndMethodologyData.intended_outcome_id);
    });

    it('sets additional_details', () => {
      expect(data.additional_details).to.eql(purposeAndMethodologyData.additional_details);
    });

    it('sets field_method_id', () => {
      expect(data.field_method_id).to.equal(purposeAndMethodologyData.field_method_id);
    });

    it('sets ecological_season_id', () => {
      expect(data.ecological_season_id).to.equal(purposeAndMethodologyData.ecological_season_id);
    });

    it('sets vantage_code_ids', () => {
      expect(data.vantage_code_ids).to.equal(purposeAndMethodologyData.vantage_code_ids);
    });

    it('sets surveyed_all_areas', () => {
      expect(data.surveyed_all_areas).to.equal(true);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(purposeAndMethodologyData.revision_count);
    });
  });
});
