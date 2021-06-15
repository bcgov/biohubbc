import { expect } from 'chai';
import { describe } from 'mocha';
import { getBlockObservationListSQL } from './observation-view-queries';

describe('getBlockObservationListSQL', () => {
  it('returns null response when null surveyId provided', () => {
    const response = getBlockObservationListSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid surveyId provided', () => {
    const response = getBlockObservationListSQL(1);

    expect(response).to.not.be.null;
  });
});
