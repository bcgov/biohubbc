import { expect } from 'chai';
import { describe } from 'mocha';
import { getAdministrativeActivitiesSQL } from './administrative-activity-queries';

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
