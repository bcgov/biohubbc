import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getActivitiesByProjectSQL,
  getAncillarySpeciesByProjectSQL,
  getClimateInitiativesByProjectSQL,
  getFocalSpeciesByProjectSQL,
  getFundingSourceByProjectSQL,
  getIUCNActionClassificationByProjectSQL,
  getProjectListSQL,
  getProjectSQL,
  getRegionsByProjectSQL
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

describe('getRegionsByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getRegionsByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getRegionsByProjectSQL(1);

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

describe('getClimateInitiativesByProjectSQL', () => {
  it('Null projectId', () => {
    const response = getClimateInitiativesByProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('valid projectId', () => {
    const response = getClimateInitiativesByProjectSQL(1);

    expect(response).to.not.be.null;
  });
});
