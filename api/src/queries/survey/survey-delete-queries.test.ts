import { expect } from 'chai';
import { describe } from 'mocha';
import { deleteFocalSpeciesSQL, deleteAncillarySpeciesSQL, deleteSurveyProprietorSQL } from './survey-delete-queries';

describe('deleteFocalSpeciesSQL', () => {
  it('returns null when null survey id param provided', () => {
    const response = deleteFocalSpeciesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = deleteFocalSpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteAncillarySpeciesSQL', () => {
  it('returns null when null survey id param provided', () => {
    const response = deleteAncillarySpeciesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when valid params passed in', () => {
    const response = deleteAncillarySpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyProprietorSQL', () => {
  it('returns null when surveyId is falsey value not equal to 0', () => {
    const response = deleteSurveyProprietorSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when survey proprietor id is falsey value not equal to 0', () => {
    const response = deleteSurveyProprietorSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null when valid params passed in', () => {
    const response = deleteSurveyProprietorSQL(1, 1);

    expect(response).to.not.be.null;
  });
});
