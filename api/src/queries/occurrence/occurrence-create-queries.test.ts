import { expect } from 'chai';
import { describe } from 'mocha';
import { PostOccurrence } from '../../models/occurrence-create';
import { postOccurrenceSQL, postOccurrenceSubmissionSQL } from './occurrence-create-queries';

describe('postOccurrenceSubmissionSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = postOccurrenceSubmissionSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId provided', () => {
    const response = postOccurrenceSubmissionSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('postOccurrenceSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = postOccurrenceSQL((null as unknown) as number, {} as PostOccurrence);

    expect(response).to.be.null;
  });

  it('returns null response when null occurrence provided', () => {
    const response = postOccurrenceSQL(1, (null as unknown) as PostOccurrence);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId and occurrence provided', () => {
    const response = postOccurrenceSQL(1, new PostOccurrence());

    expect(response).to.not.be.null;
  });

  it('returns non null response when occurrence has verbatimCoordinates', () => {
    const response = postOccurrenceSQL(1, new PostOccurrence({ verbatimCoordinates: '9N 300457 5884632' }));

    expect(response).to.not.be.null;
  });
});
