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

    it('sets common survey methodology', () => {
      expect(data.common_survey_methodology).to.equal('');
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

    const surveyData = {
      id: 1,
      name: 'survey name',
      objectives: 'purpose of survey',
      start_date: '2020-04-20T07:00:00.000Z',
      end_date: '2020-05-20T07:00:00.000Z',
      revision_count: 1,
      focal_species: ['species'],
      ancillary_species: ['ancillary'],
      common_survey_methodology: 'method',
      lead_first_name: 'lead',
      lead_last_name: 'last',
      location_name: 'area',
      type: 'scientific',
      number: '123',
      funding_sources: [
        {
          pfs_id: 1,
          funding_amount: 100,
          agency_name: 'name agency',
          funding_start_date: '2020/04/04',
          funding_end_date: '2020/05/05'
        }
      ],
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
      data = new GetViewSurveyDetailsData(surveyData);
    });

    it('sets survey_name', () => {
      expect(data.survey_name).to.equal(surveyData.name);
    });

    it('sets survey_purpose', () => {
      expect(data.survey_purpose).to.equal(surveyData.objectives);
    });

    it('sets focal_species', () => {
      expect(data.focal_species).to.eql(surveyData.focal_species);
    });

    it('sets ancillary_species', () => {
      expect(data.ancillary_species).to.eql(surveyData.ancillary_species);
    });

    it('sets common survey methodology', () => {
      expect(data.common_survey_methodology).to.equal(surveyData.common_survey_methodology);
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
      expect(data.funding_sources).to.eql([
        {
          pfs_id: 1,
          funding_amount: 100,
          agency_name: 'name agency',
          funding_start_date: '2020/04/04',
          funding_end_date: '2020/05/05'
        }
      ]);
    });
  });
});
