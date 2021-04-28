import { expect } from 'chai';
import { describe } from 'mocha';
import {
  countPendingAdministrativeActivitiesSQL,
  getAdministrativeActivitiesSQL,
  postAdministrativeActivitySQL,
  putAdministrativeActivitySQL
} from './administrative-activity-queries';

describe('getAdministrativeActivitiesSQL', () => {
  it('returns non null response when no administrativeActivityTypeName or administrativeActivityStatusTypes provided', () => {
    const response = getAdministrativeActivitiesSQL();

    expect(response).to.not.be.null;
  });

  it('returns non null response when administrativeActivityStatusTypes is null and administrativeActivityStatusTypes is valid', () => {
    const response = getAdministrativeActivitiesSQL((null as unknown) as string, ['status']);

    expect(response).to.not.be.null;
  });

  it('returns non null response when administrativeActivityStatusTypes is empty string and administrativeActivityStatusTypes is valid', () => {
    const response = getAdministrativeActivitiesSQL('', ['status']);

    expect(response).to.not.be.null;
  });

  it('returns non null response when administrativeActivityStatusTypes is valid and administrativeActivityStatusTypes is null', () => {
    const response = getAdministrativeActivitiesSQL('type', (null as unknown) as string[]);

    expect(response).to.not.be.null;
  });

  it('returns non null response when administrativeActivityStatusTypes is valid and administrativeActivityStatusTypes is empty', () => {
    const response = getAdministrativeActivitiesSQL('type', []);

    expect(response).to.not.be.null;
  });

  it('returns non null response when valid parameters provided', () => {
    const response = getAdministrativeActivitiesSQL('type', ['status 1', 'status 2']);

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

describe('countPendingAdministrativeActivitiesSQL', () => {
  it('has a null userIdentifier', () => {
    const response = countPendingAdministrativeActivitiesSQL((null as unknown) as string);
    expect(response).to.be.null;
  });

  it('has a valid userIdentifier', () => {
    const response = countPendingAdministrativeActivitiesSQL('username');
    expect(response).to.not.be.null;
  });
});

describe('putAdministrativeActivitySQL', () => {
  it('has a null administrativeActivityId', () => {
    const response = putAdministrativeActivitySQL((null as unknown) as number, 1);
    expect(response).to.be.null;
  });

  it('has a null administrativeActivityStatusTypeId', () => {
    const response = putAdministrativeActivitySQL((null as unknown) as number, 1);
    expect(response).to.be.null;
  });

  it('has valid parameters', () => {
    const response = putAdministrativeActivitySQL(1, 1);
    expect(response).to.not.be.null;
  });
});
