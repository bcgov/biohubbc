import { numberOrNull } from './string-utils';

describe('numberOrNull', () => {
  it('should return null for null input', () => {
    expect(numberOrNull(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(numberOrNull(undefined)).toBeNull();
  });

  it('should return null for empty string input', () => {
    expect(numberOrNull('')).toBeNull();
  });

  it('should return a number for a valid string number input', () => {
    expect(numberOrNull('123')).toBe(123);
  });

  it('should return NaN for an invalid string number input', () => {
    expect(numberOrNull('abc')).toBeNaN();
  });

  it('should return a number for a string with leading and trailing spaces', () => {
    expect(numberOrNull('  456  ')).toBe(456);
  });

  it('should return a number for a string with a decimal number', () => {
    expect(numberOrNull('78.9')).toBe(78.9);
  });

  it('should return a number for a string with a negative number', () => {
    expect(numberOrNull('-42')).toBe(-42);
  });
});
