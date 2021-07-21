import { expect } from 'chai';
import { describe } from 'mocha';
import { getNonSamplingPermitsSQL, getAllPermitsSQL } from './permit-view-queries';

describe('getNonSamplingPermitsSQL', () => {
  it('returns null when no system user id', () => {
    const response = getNonSamplingPermitsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when all fields are passed in as expected', () => {
    const response = getNonSamplingPermitsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getAllPermitsSQL', () => {
  it('returns null when no system user id', () => {
    const response = getAllPermitsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when all fields are passed in as expected', () => {
    const response = getAllPermitsSQL(1);

    expect(response).to.not.be.null;
  });
});
