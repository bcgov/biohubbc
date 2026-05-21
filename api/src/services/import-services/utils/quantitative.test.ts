import { expect } from 'chai';
import { validateQuantitativeValue } from './quantitative';

describe('validateQuantitativeValue', () => {
  it('should return the value if it is valid', () => {
    const quantitativeTypeDefinition = {
      min: 0,
      max: 10
    };

    const result = validateQuantitativeValue(2, quantitativeTypeDefinition);
    expect(result).to.equal(2);
  });

  it('should return an error if the value is not a number', () => {
    const quantitativeTypeDefinition = {
      min: 0,
      max: 10
    };

    const result = validateQuantitativeValue('2', quantitativeTypeDefinition);
    expect(Array.isArray(result)).to.be.true;
    if (!Array.isArray(result)) {
      expect.fail('Expected validation errors array');
    }

    expect(result[0].error).to.contain('a number');
  });

  it('should return an error if the value is too large', () => {
    const quantitativeTypeDefinition = {
      min: 0,
      max: 10
    };

    const result = validateQuantitativeValue(11, quantitativeTypeDefinition);
    expect(Array.isArray(result)).to.be.true;
    if (!Array.isArray(result)) {
      expect.fail('Expected validation errors array');
    }

    expect(result[0].error).to.contain('too large');
  });

  it('should return an error if the value is too small', () => {
    const quantitativeTypeDefinition = {
      min: 0,
      max: 10
    };

    const result = validateQuantitativeValue(-1, quantitativeTypeDefinition);
    expect(Array.isArray(result)).to.be.true;
    if (!Array.isArray(result)) {
      expect.fail('Expected validation errors array');
    }

    expect(result[0].error).to.contain('too small');
  });
});
