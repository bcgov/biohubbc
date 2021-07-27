import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteSurveyOccurrencesSQL,
  getLatestSurveyOccurrenceSubmissionSQL,
  insertSurveyOccurrenceSubmissionSQL
} from './survey-occurrence-queries';

describe('insertSurveyOccurrenceSubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL((null as unknown) as number, 'fileSource', 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null source provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL(1, (null as unknown) as string, 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL(1, 'fileSource', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = insertSurveyOccurrenceSubmissionSQL(1, 'fileSource', 'fileKey');

    expect(response).to.not.be.null;
  });
});

describe('getLatestSurveyOccurrenceSubmission', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getLatestSurveyOccurrenceSubmissionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = getLatestSurveyOccurrenceSubmissionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteSurveyOccurrencesSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = deleteSurveyOccurrencesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid params provided', () => {
    const response = deleteSurveyOccurrencesSQL(1);

    expect(response).to.not.be.null;
  });
});
