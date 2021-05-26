import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveyProprietorSQL, getSurveyListSQL, getSurveyForViewSQL } from './survey-view-queries';

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
