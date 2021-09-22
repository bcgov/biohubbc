import { expect } from 'chai';
import { describe } from 'mocha';
import { getOccurrencesForViewSQL } from './occurrence-view-queries';

describe('getOccurrencesForViewSQL', () => {
  it('returns null response when null occurrenceSubmissionId provided', () => {
    const response = getOccurrencesForViewSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid occurrenceSubmissionId provided', () => {
    const response = getOccurrencesForViewSQL(1);

    expect(response).to.not.be.null;
  });
});
