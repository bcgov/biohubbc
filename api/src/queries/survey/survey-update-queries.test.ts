import { expect } from 'chai';
import { describe } from 'mocha';
import { PutSurveyData } from '../../models/survey-update';
import { putSurveySQL } from './survey-update-queries';

describe('putSurveySQL', () => {
  const surveyData: PutSurveyData = {
    name: 'test',
    objectives: 'objectives',
    species: 'species',
    start_date: '2020/04/04',
    end_date: '2020/05/05',
    lead_first_name: 'first',
    lead_last_name: 'last',
    revision_count: 1,
    location_name: 'location',
    geometry: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-128, 55],
              [-128, 55.5],
              [-128, 56],
              [-126, 58],
              [-128, 55]
            ]
          ]
        },
        properties: {
          name: 'Biohub Islands'
        }
      }
    ]
  };

  it('returns null when null project id param provided', () => {
    const response = putSurveySQL((null as unknown) as number, 1, surveyData, 1);

    expect(response).to.be.null;
  });

  it('returns null when null survey id param provided', () => {
    const response = putSurveySQL(1, (null as unknown) as number, surveyData, 1);

    expect(response).to.be.null;
  });

  it('returns null when null survey data param provided', () => {
    const response = putSurveySQL((null as unknown) as number, (null as unknown) as number, null, 1);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = putSurveySQL(1, 2, surveyData, 1);

    expect(response).to.not.be.null;
  });
});
