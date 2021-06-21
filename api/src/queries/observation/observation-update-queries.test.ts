import { expect } from 'chai';
import { describe } from 'mocha';
import { getBlockObservationSQL, updateBlockObservationSQL } from './observation-update-queries';

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

describe('updateBlockObservationSQL', () => {
  it('returns null response when null observationId provided', () => {
    const response = updateBlockObservationSQL((null as unknown) as number, { block_name: 1 });

    expect(response).to.be.null;
  });

  it('returns null response when null observationData provided', () => {
    const response = updateBlockObservationSQL(1, null);

    expect(response).to.be.null;
  });

  it('returns non null response when valid observationId and data provided', () => {
    const response = updateBlockObservationSQL(1, { block_name: 1 });

    expect(response).to.not.be.null;
  });
});
