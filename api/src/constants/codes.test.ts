import { expect } from 'chai';
import { describe } from 'mocha';
import { region, regional_offices } from './codes';

describe('region', () => {
  it('has values', () => {
    expect(region).is.not.empty;
  });
});

describe('regional_offices', () => {
  it('has values', () => {
    expect(regional_offices).is.not.empty;
  });
});
