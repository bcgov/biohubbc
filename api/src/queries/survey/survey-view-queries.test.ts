import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveyListSQL } from '../../queries/survey/survey-view-queries';
import {
  getAllAssignablePermitsForASurveySQL,
  getSurveyBasicDataForViewSQL,
  getSurveyFundingSourcesDataForViewSQL,
  getSurveyIdsSQL,
  getSurveySpeciesDataForViewSQL
} from './survey-view-queries';

describe('getAllAssignablePermitsForASurveySQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getAllAssignablePermitsForASurveySQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getAllAssignablePermitsForASurveySQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyIdsSQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getSurveyIdsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyIdsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyListSQL', () => {
  it('returns a null response when null project id param provided', () => {
    const response = getSurveyListSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyListSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyBasicDataForViewSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getSurveyBasicDataForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyBasicDataForViewSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyFundingSourcesDataForViewSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getSurveyFundingSourcesDataForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyFundingSourcesDataForViewSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveySpeciesDataForViewSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getSurveySpeciesDataForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveySpeciesDataForViewSQL(1);

    expect(response).to.not.be.null;
  });
});
