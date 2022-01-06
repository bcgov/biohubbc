import { expect } from 'chai';
import { describe } from 'mocha';
import { getSpatialSearchResultsSQL } from './search-queries';

describe('getSpatialSearchResultsSQL', () => {
  it('returns null when no systemUserId provided', () => {
    const response = getSpatialSearchResultsSQL(false, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null when isUserAdmin is true and systemUserId provided', () => {
    const response = getSpatialSearchResultsSQL(true, 1);

    expect(response).to.not.be.null;
  });

  it('returns non null when isUserAdmin is false and systemUserId provided', () => {
    const response = getSpatialSearchResultsSQL(false, 1);

    expect(response).to.not.be.null;
  });
});
