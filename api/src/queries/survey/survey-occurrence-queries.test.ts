import { expect } from 'chai';
import { describe } from 'mocha';
import { postSurveyOccurrenceSubmissionSQL } from './survey-occurrence-queries';

describe('postSurveyOccurrenceSubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = postSurveyOccurrenceSubmissionSQL((null as unknown) as number, 'fileSource', 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null source provided', () => {
    const response = postSurveyOccurrenceSubmissionSQL(1, (null as unknown) as string, 'fileKey');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = postSurveyOccurrenceSubmissionSQL(1, 'fileSource', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId and attachmentId provided', () => {
    const response = postSurveyOccurrenceSubmissionSQL(1, 'fileSource', 'fileKey');

    expect(response).to.not.be.null;
  });
});
