import { expect } from 'chai';
import { describe } from 'mocha';
import { coordinator_agency, region, regional_offices, species } from './codes';

describe('coordinator_agency', () => {
  it('has values', () => {
    expect(coordinator_agency).is.not.empty;
  });
});

describe('region', () => {
  it('has values', () => {
    expect(region).is.not.empty;
  });
});

describe('species', () => {
  it('has values', () => {
    expect(species).is.not.empty;
  });
});

describe('regional_offices', () => {
  it('has values', () => {
    expect(regional_offices).is.not.empty;
  });
});
