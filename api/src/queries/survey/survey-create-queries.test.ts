import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSurveyObject, PostSurveyProprietorData } from '../../models/survey-create';
import { postSurveyProprietorSQL, postSurveySQL } from './survey-create-queries';

describe('postSurveySQL', () => {
  it('returns null when null project param provided', () => {
    const survey = new PostSurveyObject();
    const response = postSurveySQL((null as unknown) as number, survey);

    expect(response).to.be.null;
  });

  it('returns a survey id when valid project param provided without proprietary data', () => {
    const surveyData = {
      survey_name: 'survey_name',
      start_date: '2020/04/03',
      end_date: '2020/05/05',
      species: 'some species',
      survey_purpose: 'purpose',
      biologist_first_name: 'John',
      biologist_last_name: 'Smith',
      survey_area_name: 'some place',
      park: 'a park',
      management_unit: 'a unit',
      survey_data_proprietary: false
    };

    const postSurveyObject = new PostSurveyObject(surveyData);
    const response = postSurveySQL(1, postSurveyObject);

    expect(response).to.not.be.null;
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
