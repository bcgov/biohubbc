import { expect } from 'chai';
import { describe } from 'mocha';
import { ADMINISTRATIVE_ACTIVITY_STATUS_TYPE } from '../../paths/administrative-activities';
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

  it('returns non null response when administrativeActivityStatusTypes is undefined and administrativeActivityStatusTypes is provided', () => {
    const response = getAdministrativeActivitiesSQL(undefined, ['status']);

    expect(response).to.not.be.null;
  });

  it('returns non null response when administrativeActivityStatusTypes is empty and administrativeActivityStatusTypes is provided', () => {
    const response = getAdministrativeActivitiesSQL([], ['status']);

    expect(response).to.not.be.null;
  });

  it('returns non null response when administrativeActivityStatusTypes is provided and administrativeActivityStatusTypes is undefined', () => {
    const response = getAdministrativeActivitiesSQL(['type'], undefined);

    expect(response).to.not.be.null;
  });

  it('returns non null response when administrativeActivityStatusTypes is provided and administrativeActivityStatusTypes is empty', () => {
    const response = getAdministrativeActivitiesSQL(['type'], []);

    expect(response).to.not.be.null;
  });

  it('returns non null response when allor parameters provided', () => {
    const response = getAdministrativeActivitiesSQL(['type 1', 'type 2'], ['status 1', 'status 2']);

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
  it('returns valid sql statement', () => {
    const response = putAdministrativeActivitySQL(1, ADMINISTRATIVE_ACTIVITY_STATUS_TYPE.ACTIONED);
    expect(response).to.not.be.null;
  });
});
