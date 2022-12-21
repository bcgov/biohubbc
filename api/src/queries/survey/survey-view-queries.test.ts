import { expect } from 'chai';
import { describe } from 'mocha';
import { getSurveyIdsSQL } from './survey-view-queries';

describe('getSurveyIdsSQL', () => {
  it('returns a sql statement', () => {
    const response = getSurveyIdsSQL(1);

    expect(response).to.not.be.null;
  });
});
