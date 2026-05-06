import { expect } from 'chai';
import { validateQualitativeValue } from './qualitative';

describe('validateQualitativeValue', () => {
  it('should return the option id if the value is valid', () => {
    const value = 'red';
    const qualitativeTypeDefinition = {
      options: [
        {
          option_id: '456',
          option_name: 'red'
        }
      ]
    };
    const result = validateQualitativeValue(value, qualitativeTypeDefinition);

    expect(result).to.be.equal('456');
  });

  it('should return the option id if the value is valid and case insensitive', () => {
    const value = 'Red';
    const qualitativeTypeDefinition = {
      options: [
        {
          option_id: '456',
          option_name: 'red'
        }
      ]
    };
    const result = validateQualitativeValue(value, qualitativeTypeDefinition);

    expect(result).to.be.equal('456');
  });

  it('should return an error if the value is not a string', () => {
    const value = 123;
    const qualitativeTypeDefinition = {
      options: [
        {
          option_id: '456',
          option_name: 'red'
        }
      ]
    };
    const result = validateQualitativeValue(value, qualitativeTypeDefinition);

    expect(Array.isArray(result)).to.be.true;
    if (!Array.isArray(result)) {
      expect.fail('Expected validation errors array');
    }

    expect(result[0].error).to.contain('a string');
  });

  it('should return an error if the value is not a valid option', () => {
    const value = 'blue';
    const qualitativeTypeDefinition = {
      options: [
        {
          option_id: '456',
          option_name: 'red'
        }
      ]
    };
    const result = validateQualitativeValue(value, qualitativeTypeDefinition);

    expect(Array.isArray(result)).to.be.true;
    if (!Array.isArray(result)) {
      expect.fail('Expected validation errors array');
    }

    expect(result[0].error).to.contain('Invalid qualitative option');
    expect(result[0].values).to.be.an('array').that.has.a.lengthOf(1).and.includes('red');
  });
});
