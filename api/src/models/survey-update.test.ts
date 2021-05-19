import { expect } from 'chai';
import { describe } from 'mocha';
import { PutSurveyData } from './survey-update';

describe('PutSurveyData', () => {
  describe('No values provided', () => {
    let data: PutSurveyData;

    before(() => {
      data = new PutSurveyData(null);
    });

    it('sets name', () => {
      expect(data.name).to.equal(null);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(null);
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
    let data: PutSurveyData;

    const surveyData = {
      survey_name: 'survey name',
      survey_purpose: 'survey purpose',
      focal_species: [1, 2],
      ancillary_species: [3, 4],
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
    };

    before(() => {
      data = new PutSurveyData(surveyData);
    });

    it('sets name', () => {
      expect(data.name).to.equal(surveyData.survey_name);
    });

    it('sets objectives', () => {
      expect(data.objectives).to.equal(surveyData.survey_purpose);
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

    it('sets lead_first_name', () => {
      expect(data.lead_first_name).to.equal(surveyData.biologist_first_name);
    });

    it('sets lead_last_name', () => {
      expect(data.lead_last_name).to.equal(surveyData.biologist_last_name);
    });

    it('sets geometry', () => {
      expect(data.geometry).to.eql(surveyData.geometry);
    });

    it('sets location_name', () => {
      expect(data.location_name).to.equal(surveyData.survey_area_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyData.revision_count);
    });
  });
});
