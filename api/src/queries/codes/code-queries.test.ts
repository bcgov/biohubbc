import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getActivitySQL,
  getAdministrativeActivityStatusTypeSQL,
  getFirstNationsSQL,
  getFundingSourceSQL,
  getInvestmentActionCategorySQL,
  getIUCNConservationActionLevel1ClassificationSQL,
  getIUCNConservationActionLevel2SubclassificationSQL,
  getIUCNConservationActionLevel3SubclassificationSQL,
  getManagementActionTypeSQL,
  getProjectTypeSQL,
  getProprietorTypeSQL,
  getSystemRolesSQL,
  getTaxonsSQL
} from './code-queries';

describe('getManagementActionTypeSQL', () => {
  it('returns valid sql statement', () => {
    const response = getManagementActionTypeSQL();
    expect(response).to.not.be.null;
  });
});

describe('getFirstNationsSQL', () => {
  it('returns valid sql statement', () => {
    const response = getFirstNationsSQL();
    expect(response).to.not.be.null;
  });
});

describe('getFundingSourceSQL', () => {
  it('returns valid sql statement', () => {
    const response = getFundingSourceSQL();
    expect(response).to.not.be.null;
  });
});

describe('getProprietorTypeSQL', () => {
  it('returns valid sql statement', () => {
    const response = getProprietorTypeSQL();
    expect(response).to.not.be.null;
  });
});

describe('getActivitySQL', () => {
  it('returns valid sql statement', () => {
    const response = getActivitySQL();
    expect(response).to.not.be.null;
  });
});

describe('getProjectTypeSQL', () => {
  it('returns valid sql statement', () => {
    const response = getProjectTypeSQL();
    expect(response).to.not.be.null;
  });
});

describe('getInvestmentActionCategorySQL', () => {
  it('returns valid sql statement', () => {
    const response = getInvestmentActionCategorySQL();
    expect(response).to.not.be.null;
  });
});

describe('getIUCNConservationActionLevel1ClassificationSQL', () => {
  it('returns valid sql statement', () => {
    const response = getIUCNConservationActionLevel1ClassificationSQL();
    expect(response).to.not.be.null;
  });
});

describe('getIUCNConservationActionLevel2SubclassificationSQL', () => {
  it('returns valid sql statement', () => {
    const response = getIUCNConservationActionLevel2SubclassificationSQL();
    expect(response).to.not.be.null;
  });
});

describe('getIUCNConservationActionLevel3SubclassificationSQL', () => {
  it('returns valid sql statement', () => {
    const response = getIUCNConservationActionLevel3SubclassificationSQL();
    expect(response).to.not.be.null;
  });
});

describe('getSystemRolesSQL', () => {
  it('returns valid sql statement', () => {
    const response = getSystemRolesSQL();
    expect(response).to.not.be.null;
  });
});

describe('getAdministrativeActivityStatusTypeSQL', () => {
  it('returns valid sql statement', () => {
    const response = getAdministrativeActivityStatusTypeSQL();
    expect(response).to.not.be.null;
  });
});

describe('getTaxonsSQL', () => {
  it('returns valid sql statement', () => {
    const response = getTaxonsSQL();
    expect(response).to.not.be.null;
  });
});
