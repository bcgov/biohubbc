import { expect } from 'chai';
import { describe } from 'mocha';
import { GetSurveyData } from './survey-view-update';

describe('GetSurveyData', () => {
  describe('No values provided', () => {
    let data: GetSurveyData;

    before(() => {
      data = new GetSurveyData(null);
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
    let data: GetSurveyData;

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
      data = new GetSurveyData(surveyData);
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
    let data: GetSurveyData;

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
      data = new GetSurveyData(surveyData);
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
