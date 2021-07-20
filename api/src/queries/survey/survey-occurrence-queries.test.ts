import { expect } from 'chai';
import { describe } from 'mocha';
import { insertSurveyOccurrenceSubmissionSQL } from './survey-occurrence-queries';

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
