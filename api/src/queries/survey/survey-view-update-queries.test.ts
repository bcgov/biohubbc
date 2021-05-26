import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveyForViewSQL } from './survey-view-queries';

describe('getSurveySQL', () => {
  it('returns null when null survey id param provided', () => {
    const response = getSurveyForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = getSurveyForViewSQL(1);

    expect(response).to.not.be.null;
  });
});
