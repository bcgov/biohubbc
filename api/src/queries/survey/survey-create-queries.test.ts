import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSurveyObject, PostSurveyProprietorData } from '../../models/survey-create';
import {
  postFocalSpeciesSQL,
  postAncillarySpeciesSQL,
  postSurveyProprietorSQL,
  postSurveySQL,
  postNewSurveyPermitSQL,
  insertSurveyFundingSourceSQL
} from './survey-create-queries';

describe('postSurveySQL', () => {
  it('returns null when null project param provided', () => {
    const survey = new PostSurveyObject();
    const response = postSurveySQL((null as unknown) as number, survey);

    expect(response).to.be.null;
  });

  it('returns a survey id when valid project param provided without proprietary data and geometry', () => {
    const surveyData = {
      survey_name: 'survey_name',
      start_date: '2020/04/03',
      end_date: '2020/05/05',
      species: 'some species',
      survey_purpose: 'purpose',
      biologist_first_name: 'John',
      biologist_last_name: 'Smith',
      survey_area_name: 'some place',
      survey_data_proprietary: false
    };

    const postSurveyObject = new PostSurveyObject(surveyData);
    const response = postSurveySQL(1, postSurveyObject);

    expect(response).to.not.be.null;
  });

  it('returns a survey id when valid project param provided without proprietary data but with geometry', () => {
    const surveyData = {
      survey_name: 'survey_name',
      start_date: '2020/04/03',
      end_date: '2020/05/05',
      species: 'some species',
      survey_purpose: 'purpose',
      biologist_first_name: 'John',
      biologist_last_name: 'Smith',
      survey_area_name: 'some place',
      survey_data_proprietary: false,
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
    };

    const postSurveyObject = new PostSurveyObject(surveyData);
    const response = postSurveySQL(1, postSurveyObject);

    expect(response).to.not.be.null;
    expect(response?.values).to.deep.include(
      '{"type":"Polygon","coordinates":[[[-128,55],[-128,55.5],[-128,56],[-126,58],[-128,55]]]}'
    );
  });
});

describe('postSurveyProprietarySQL', () => {
  it('returns null when null surveyId provided', () => {
    const survey_proprietor = new PostSurveyProprietorData();
    const response = postSurveyProprietorSQL((null as unknown) as number, survey_proprietor);

    expect(response).to.be.null;
  });

  it('returns a survey_proprietor id when valid survey param provided with proprietary data', () => {
    const surveyProprietorData = {
      proprietary_data_category: 2,
      first_nations_id: 8,
      category_rationale: 'rationale',
      proprietor_name: 'a name',
      data_sharing_agreement_required: false
    };

    const postSurveyProprietorData = new PostSurveyProprietorData(surveyProprietorData);
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
  it('returns null when null surveyId provided', () => {
    const response = insertSurveyFundingSourceSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when null fundingSourceId provided', () => {
    const response = insertSurveyFundingSourceSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns sql statement when valid params provided', () => {
    const response = insertSurveyFundingSourceSQL(1, 2);

    expect(response).to.not.be.null;
  });
});
