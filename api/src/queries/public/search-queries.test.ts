import { expect } from 'chai';
import { describe } from 'mocha';
import { getPublicSpatialSearchResultsSQL } from './search-queries';

describe('getPublicSpatialSearchResultsSQL', () => {
  it('returns a non null result', () => {
    const response = getPublicSpatialSearchResultsSQL();

    expect(response).to.not.be.null;
  });
});
