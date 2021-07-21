import { expect } from 'chai';
import { describe } from 'mocha';
import { associatePermitToProjectSQL } from './permit-update-queries';

describe('associatePermitToProjectSQL', () => {
  it('returns null when no permit id', () => {
    const response = associatePermitToProjectSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when no project id', () => {
    const response = associatePermitToProjectSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a non null response when all fields are passed in as expected', () => {
    const response = associatePermitToProjectSQL(123, 2);

    expect(response).to.not.be.null;
    expect(response?.values).to.deep.include(123);
  });
});
