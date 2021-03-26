import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getStakeholderPartnershipsByProjectSQL,
  getFocalSpeciesByProjectSQL,
  getAncillarySpeciesByProjectSQL
} from './project-view-update-queries';

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

describe('getFocalSpeciesByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getFocalSpeciesByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getFocalSpeciesByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getAncillarySpeciesByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getAncillarySpeciesByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getAncillarySpeciesByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});
