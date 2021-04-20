import { expect } from 'chai';
import { describe } from 'mocha';
import { getAdministrativeActivitiesSQL } from '../administrative-activity/administrative-activity-queries';

describe('getAdministrativeActivitiesSQL', () => {
  it('returns null response when null administrativeActivityTypeName provided', () => {
    const response = getAdministrativeActivitiesSQL((null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid administrativeActivityTypeName provided', () => {
    const response = getAdministrativeActivitiesSQL('type');

    expect(response).to.not.be.null;
  });
});
