import { expect } from 'chai';
import { describe } from 'mocha';
import { getIndigenousPartnershipsByProjectSQL, getCoordinatorByProjectSQL, getIUCNActionClassificationByProjectSQL } from './project-update-queries';

describe('getIndigenousPartnershipsByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getIndigenousPartnershipsByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getIndigenousPartnershipsByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getIUCNActionClassificationByProjectSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getIUCNActionClassificationByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getIUCNActionClassificationByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});


describe('getCoordinatorByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getCoordinatorByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getCoordinatorByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});
