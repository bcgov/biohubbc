import { expect } from 'chai';
import { describe } from 'mocha';
import { getSpatialSearchResultsSQL } from './search-queries';

describe('getSpatialSearchResultsSQL', () => {
  it('returns a SQLStatement when valid filter fields provided (project)', () => {
    const response = getSpatialSearchResultsSQL();

    expect(response).to.not.be.null;
  });
});
