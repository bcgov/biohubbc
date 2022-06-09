import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getSurveyProprietorForUpdateSQL,
  getSurveyPurposeAndMethodologyForUpdateSQL
} from './survey-view-update-queries';

describe('getSurveyPurposeAndMethodologyForUpdateSQL', () => {
  it('returns a sql statement', () => {
    const response = getSurveyPurposeAndMethodologyForUpdateSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getSurveyProprietorForUpdateSQL', () => {
  it('returns a sql statement', () => {
    const response = getSurveyProprietorForUpdateSQL(1);

    expect(response).to.not.be.null;
  });
});
