import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveySQL } from './survey-view-update-queries';

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
