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

    it('sets species', () => {
      expect(data.species).to.equal(null);
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
      species: 'species',
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      biologist_first_name: 'first',
      biologist_last_name: 'last',
      survey_area_name: 'survey area name',
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

    it('sets species', () => {
      expect(data.species).to.equal(surveyData.species);
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

    it('sets location_name', () => {
      expect(data.location_name).to.equal(surveyData.survey_area_name);
    });

    it('sets revision_count', () => {
      expect(data.revision_count).to.equal(surveyData.revision_count);
    });
  });
});
