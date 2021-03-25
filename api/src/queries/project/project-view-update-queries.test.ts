import { expect } from 'chai';
import { describe } from 'mocha';
import { getStakeholderPartnershipsByProjectSQL } from './project-view-update-queries';

describe('getStakeholderPartnershipsByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getStakeholderPartnershipsByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getStakeholderPartnershipsByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});
