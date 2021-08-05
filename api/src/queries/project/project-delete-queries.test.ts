import { expect } from 'chai';
import { describe } from 'mocha';
import {
  deleteActivitiesSQL,
  deleteIndigenousPartnershipsSQL,
  deleteIUCNSQL,
  deleteStakeholderPartnershipsSQL,
  deleteProjectFundingSourceSQL,
  deletePermitSQL,
  deleteProjectSQL
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

describe('deletePermitSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deletePermitSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deletePermitSQL(1);

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

describe('deleteProjectSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectFundingSourceSQL', () => {
  it('returns null response when null pfsId (project funding source) provided', () => {
    const response = deleteProjectFundingSourceSQL((null as unknown) as number, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = deleteProjectFundingSourceSQL(1, 1);

    expect(response).to.not.be.null;
  });
});
