import { expect } from 'chai';
import { describe } from 'mocha';
import { getAdministrativeActivitiesSQL } from './administrative-activity-queries';
import { postAdministrativeActivitySQL } from './administrative-activity-queries';

describe('getAdministrativeActivitiesSQL', () => {
  it('returns non null response when no administrativeActivityTypeName provided', () => {
    const response = getAdministrativeActivitiesSQL();

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid administrativeActivityTypeName provided', () => {
    const response = getAdministrativeActivitiesSQL('type');

    expect(response).to.not.be.null;
  });
});

describe('postAdministrativeActivitySQL', () => {
  it('Null systemUserId', () => {
    const response = postAdministrativeActivitySQL((null as unknown) as number, {});
    expect(response).to.be.null;
  });

  it('has null data', () => {
    const response = postAdministrativeActivitySQL((null as unknown) as number, null);
    expect(response).to.be.null;
  });

  it('Valid parameters', () => {
    const response = postAdministrativeActivitySQL(1, {});
    expect(response).to.not.be.null;
  });
});
