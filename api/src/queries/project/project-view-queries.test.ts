import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getFundingSourceByProjectSQL,
  getIndigenousPartnershipsByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getProjectListSQL,
  getProjectSQL
} from './project-view-queries';

describe('getProjectSQL', () => {
  describe('Null project id param provided', () => {
    it('returns null', () => {
      // force the function to accept a null value
      const response = getProjectSQL((null as unknown) as number);

      expect(response).to.be.null;
    });
  });

  describe('Valid project id param provided', () => {
    it('returns a SQLStatement', () => {
      const response = getProjectSQL(1);

      expect(response).to.not.be.null;
    });
  });
});

describe('getProjectListSQL', () => {
  it('returns a SQLStatement', () => {
    const response = getProjectListSQL();

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
