import { expect } from 'chai';
import { describe } from 'mocha';
import { getBlockObservationSQL } from './observation-update-queries';

describe('getBlockObservationSQL', () => {
  it('returns null response when null observationId provided', () => {
    const response = getBlockObservationSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid observationId provided', () => {
    const response = getBlockObservationSQL(1);

    expect(response).to.not.be.null;
  });
});
