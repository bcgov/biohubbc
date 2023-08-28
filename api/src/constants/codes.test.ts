import { expect } from 'chai';
import { describe } from 'mocha';
import { region } from './codes';

describe('region', () => {
  it('has values', () => {
    expect(region).is.not.empty;
  });
});
