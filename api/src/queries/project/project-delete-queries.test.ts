import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteActivitiesSQL,
  deleteAncillarySpeciesSQL,
  deleteClimateInitiativesSQL,
  deleteFocalSpeciesSQL,
  deleteIndigenousPartnershipsSQL,
  deleteIUCNSQL,
  deleteStakeholderPartnershipsSQL
} from './project-delete-queries';

describe('deleteIUCNSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteIUCNSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteIUCNSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteFocalSpeciesSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteFocalSpeciesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteFocalSpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteAncillarySpeciesSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteAncillarySpeciesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteAncillarySpeciesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteIndigenousPartnershipsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteIndigenousPartnershipsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteIndigenousPartnershipsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteStakeholderPartnershipsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteStakeholderPartnershipsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteStakeholderPartnershipsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteActivitiesSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteActivitiesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteActivitiesSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteClimateInitiativesSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteClimateInitiativesSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteClimateInitiativesSQL(1);

    expect(response).to.not.be.null;
  });
});
