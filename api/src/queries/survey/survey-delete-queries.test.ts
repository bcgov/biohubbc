import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteAllSurveySpeciesSQL,
  deleteSurveyFundingSourceByProjectFundingSourceIdSQL,
  deleteSurveyFundingSourcesBySurveyIdSQL,
  deleteSurveyProprietorSQL,
  deleteSurveyVantageCodesSQL
} from './survey-delete-queries';

describe('deleteAllSurveySpeciesSQL', () => {
  it('returns a sql statement', () => {
    const response = deleteAllSurveySpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyProprietorSQL', () => {
  it('returns a sql statement', () => {
    const response = deleteSurveyProprietorSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyFundingSourcesBySurveyIdSQL', () => {
  it('returns a sql statement', () => {
    const response = deleteSurveyFundingSourcesBySurveyIdSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyVantageCodesSQL', () => {
  it('returns a sql statement', () => {
    const response = deleteSurveyVantageCodesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyFundingSourceByProjectFundingSourceIdSQL', () => {
  it('returns null when project funding source id is null', () => {
    const response = deleteSurveyFundingSourceByProjectFundingSourceIdSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = deleteSurveyFundingSourceByProjectFundingSourceIdSQL(1);

    expect(response).to.not.be.null;
  });
});
