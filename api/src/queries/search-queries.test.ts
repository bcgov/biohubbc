import { expect } from 'chai';
import { describe } from 'mocha';
import { getSpatialSearchResultsSQL } from './search-queries';

describe('getSpatialSearchResultsSQL', () => {
  it('returns null when no filter fields provided', () => {
    const response = getSpatialSearchResultsSQL(null);

    expect(response).to.be.null;
  });

  it('returns null when no record type filter field provided', () => {
    const response = getSpatialSearchResultsSQL({ record_type: null });

    expect(response).to.be.null;
  });

  it('returns null when no geometries in filter field provided', () => {
    const response = getSpatialSearchResultsSQL({ record_type: 'type', geometry: [] });

    expect(response).to.be.null;
  });

  it('returns null when no geometry in geometries in filter field provided', () => {
    const response = getSpatialSearchResultsSQL({ record_type: 'type', geometry: [{ geometry: null }] });

    expect(response).to.be.null;
  });

  it('returns a SQLStatement when valid filter fields provided (survey occurrence)', () => {
    const response = getSpatialSearchResultsSQL({
      record_type: 'occurrence',
      geometry: [{ geometry: { type: 'Feature' } }]
    });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when valid filter fields provided (survey)', () => {
    const response = getSpatialSearchResultsSQL({
      record_type: 'survey',
      geometry: [{ geometry: { type: 'Feature' } }]
    });

    expect(response).to.not.be.null;
  });

  it('returns a SQLStatement when valid filter fields provided (project)', () => {
    const response = getSpatialSearchResultsSQL({
      record_type: 'project',
      geometry: [{ geometry: { type: 'Feature' } }]
    });

    expect(response).to.not.be.null;
  });
});
