import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveySQL, getSurveyProprietorSQL, getSurveyListSQL } from './survey-view-queries';

describe('getSurveySQL', () => {
  it('returns null when null project id param provided', () => {
    const response = getSurveySQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when null survey id param provided', () => {
    const response = getSurveySQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveySQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyProprietorSQL', () => {
  it('returns null when null survey id param provided', () => {
    const response = getSurveyProprietorSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyProprietorSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyListSQL', () => {
  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyListSQL();

    expect(response).to.not.be.null;
  });
});
