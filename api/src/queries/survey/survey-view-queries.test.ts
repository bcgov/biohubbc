import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveyProprietorForUpdateSQL } from './survey-view-update-queries';
import { getSurveyForViewSQL, getSurveyIdsSQL, getAllAssignablePermitsForASurveySQL } from './survey-view-queries';
import { getSurveyListSQL } from '../../queries/survey/survey-view-queries';

describe('getSurveyProprietorSQL', () => {
  it('returns null when null survey id param provided', () => {
    const response = getSurveyProprietorForUpdateSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyProprietorForUpdateSQL(1);

    expect(response).to.not.be.null;
  });
});

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

describe('getSurveyForViewSQL', () => {
  it('returns a null response when null survey id param provided', () => {
    const response = getSurveyForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyForViewSQL(1);

    expect(response).to.not.be.null;
  });
});
