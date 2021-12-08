import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveyDetailsForUpdateSQL, getSurveyProprietorForUpdateSQL } from './survey-view-update-queries';

describe('getSurveyDetailsForUpdateSQL', () => {
  it('returns null when null survey id param provided', () => {
    const response = getSurveyDetailsForUpdateSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyDetailsForUpdateSQL(1);

    expect(response).to.not.be.null;
  });
});

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
