import { expect } from 'chai';
import { describe } from 'mocha';
import { PostProprietorData, PostSurveyObject } from '../../models/survey-create';
import {
  insertSurveyFundingSourceSQL,
  postAncillarySpeciesSQL,
  postFocalSpeciesSQL,
  postNewSurveyPermitSQL,
  postSurveyProprietorSQL,
  postSurveySQL
} from './survey-create-queries';

describe('postSurveySQL', () => {
  it('returns null when null projectId param provided', () => {
    const survey = new PostSurveyObject();
    const response = postSurveySQL((null as unknown) as number, survey);

    expect(response).to.be.null;
  });

  it('returns null when null survey data param provided', () => {
    const response = postSurveySQL(1, (null as unknown) as PostSurveyObject);

    expect(response).to.be.null;
  });

  it('returns a sql statement when geometry array is empty', () => {
    const surveyData = {
      survey_details: {
        survey_name: 'survey_name',
        start_date: '2020/04/03',
        end_date: '2020/05/05',
        biologist_first_name: 'John',
        biologist_last_name: 'Smith'
      },
      purpose_and_methodology: {
        field_method_id: 1,
        additional_details: 'details',
        ecological_season_id: 2,
        intended_outcome_id: 3,
        surveyed_all_areas: true
      },
      location: {
        survey_area_name: 'some place',
        geometry: []
      }
    };
    const postSurveyObject = new PostSurveyObject(surveyData);
    const response = postSurveySQL(1, postSurveyObject);

    expect(response).to.not.be.null;
  });

  it('returns a sql statement when all values provided', () => {
    const surveyData = {
      survey_details: {
        survey_name: 'survey_name',
        start_date: '2020/04/03',
        end_date: '2020/05/05',
        biologist_first_name: 'John',
        biologist_last_name: 'Smith'
      },
      purpose_and_methodology: {
        field_method_id: 1,
        additional_details: 'details',
        ecological_season_id: 2,
        intended_outcome_id: 3,
        surveyed_all_areas: true
      },
      location: {
        survey_area_name: 'some place',
        geometry: [
          {
            type: 'Feature',
            id: 'myGeo',
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
      }
    };

    const postSurveyObject = new PostSurveyObject(surveyData);
    const response = postSurveySQL(1, postSurveyObject);

    expect(response).to.not.be.null;
    expect(response?.values).to.deep.include(
      '{"type":"Polygon","coordinates":[[[-128,55],[-128,55.5],[-128,56],[-126,58],[-128,55]]]}'
    );
  });
});

describe('postSurveyProprietorSQL', () => {
  it('returns a sql statement', () => {
    const postSurveyProprietorData = new PostProprietorData(null);
    const response = postSurveyProprietorSQL(1, postSurveyProprietorData);

    expect(response).to.not.be.null;
  });
});

describe('postFocalSpeciesSQL', () => {
  it('returns null when null speciesId provided', () => {
    const response = postFocalSpeciesSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when null surveyId provided', () => {
    const response = postFocalSpeciesSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns sql statement when valid params provided', () => {
    const response = postFocalSpeciesSQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('postAncillarySpeciesSQL', () => {
  it('returns null when null speciesId provided', () => {
    const response = postAncillarySpeciesSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when null surveyId provided', () => {
    const response = postAncillarySpeciesSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns sql statement when valid params provided', () => {
    const response = postAncillarySpeciesSQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('postNewSurveyPermitSQL', () => {
  it('returns null when null projectId provided', () => {
    const response = postNewSurveyPermitSQL(1, (null as unknown) as number, 1, '123', 'scientific');

    expect(response).to.be.null;
  });

  it('returns null when null surveyId provided', () => {
    const response = postNewSurveyPermitSQL(1, 1, (null as unknown) as number, '123', 'scientific');

    expect(response).to.be.null;
  });

  it('returns null when null permitNumber provided', () => {
    const response = postNewSurveyPermitSQL(1, 1, 2, (null as unknown) as string, 'scientific');

    expect(response).to.be.null;
  });

  it('returns null when null permitType provided', () => {
    const response = postNewSurveyPermitSQL(1, 1, 2, '123', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns null when null systemUserId provided', () => {
    const response = postNewSurveyPermitSQL(null, 1, 2, '123', 'scientific');

    expect(response).to.be.null;
  });

  it('returns sql statement when valid params provided', () => {
    const response = postNewSurveyPermitSQL(1, 1, 2, '123', 'scientific');

    expect(response).to.not.be.null;
  });
});

describe('insertSurveyFundingSourceSQL', () => {
  it('returns sql statement when valid params provided', () => {
    const response = insertSurveyFundingSourceSQL(1, 2);

    expect(response).to.not.be.null;
  });
});
