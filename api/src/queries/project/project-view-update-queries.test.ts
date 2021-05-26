import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getStakeholderPartnershipsByProjectSQL,
  getActivitiesByProjectSQL,
  getLocationByProjectSQL,
  getFundingSourceByProjectSQL
} from './project-view-update-queries';

describe('getLocationByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getLocationByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getLocationByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

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

describe('getActivitiesByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getActivitiesByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getActivitiesByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getFundingSourceByProjectSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getFundingSourceByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getFundingSourceByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});
