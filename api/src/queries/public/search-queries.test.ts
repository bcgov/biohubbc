import { expect } from 'chai';
import { describe } from 'mocha';
import { getPublicSpatialSearchResultsSQL } from './search-queries';

describe('getPublicSpatialSearchResultsSQL', () => {
  it('returns a SQLStatement when valid filter fields provided (project)', () => {
    const response = getPublicSpatialSearchResultsSQL();

    expect(response).to.not.be.null;
  });
});
