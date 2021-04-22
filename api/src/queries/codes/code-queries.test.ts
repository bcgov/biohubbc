import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getManagementActionTypeSQL,
  getClimateChangeInitiativeSQL,
  getFirstNationsSQL,
  getFundingSourceSQL,
  getActivitySQL,
  getProjectTypeSQL,
  getInvestmentActionCategorySQL,
  getIUCNConservationActionLevel1ClassificationSQL,
  getIUCNConservationActionLevel2SubclassificationSQL,
  getIUCNConservationActionLevel3SubclassificationSQL,
  getSystemRolesSQL
} from './code-queries';

describe('getManagementActionTypeSQL', () => {
  it('returns valid sql statement', () => {
    const response = getManagementActionTypeSQL();
    expect(response).to.not.be.null;
  });
});

describe('getClimateChangeInitiativeSQL', () => {
  it('returns valid sql statement', () => {
    const response = getClimateChangeInitiativeSQL();
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
