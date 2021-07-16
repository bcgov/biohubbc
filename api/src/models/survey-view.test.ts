import { expect } from 'chai';
import { describe } from 'mocha';
import { GetViewSurveyDetailsData } from './survey-view';

describe('GetViewSurveyDetailsData', () => {
  describe('No values provided', () => {
    let data: GetViewSurveyDetailsData;

    before(() => {
      data = new GetViewSurveyDetailsData(null);
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

  describe('all values provided', () => {
    let data: GetViewSurveyDetailsData;

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
        type: 'scientific',
        number: '123',
        pfs_id: 1,
        funding_amount: 100,
        agency_name: 'name agency',
        funding_start_date: '2020/04/04',
        funding_end_date: '2020/05/05',
        geometry:
          '{"type":"Polygon","coordinates":[[[-128.224277,53.338275],[-128.224277,58.201367],[-124.122791,58.201367],[-124.122791,53.338275],[-128.224277,53.338275]]]}'
      }
    ];

    before(() => {
      data = new GetViewSurveyDetailsData(surveyData);
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

    it('sets permit number', () => {
      expect(data.permit_number).to.equal(surveyData[0].number);
    });

    it('sets permit type', () => {
      expect(data.permit_type).to.equal(surveyData[0].type);
    });

    it('sets funding sources', () => {
      expect(data.funding_sources).to.eql([
        {
          agency_name: surveyData[0].agency_name,
          pfs_id: surveyData[0].pfs_id,
          funding_amount: surveyData[0].funding_amount,
          funding_start_date: surveyData[0].funding_start_date,
          funding_end_date: surveyData[0].funding_end_date
        }
      ]);
    });
  });
});
