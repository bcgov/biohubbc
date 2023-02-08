import { expect } from 'chai';
import { safeToLowerCase, safeTrim } from './string-utils';

describe('safeToLowerCase', () => {
  describe('returns value lowercase', () => {
    it('when value is a lowercase string', () => {
      expect(safeToLowerCase('string')).to.equal('string');
    });

    it('when value is an uppercase string', () => {
      expect(safeToLowerCase('STRING')).to.equal('string');
    });

    it('when value is a mixed case string', () => {
      expect(safeToLowerCase('sTRiNG')).to.equal('string');
    });
  });

  describe('returns value unaltered', () => {
    it('when value is a negative number', () => {
      expect(safeToLowerCase(-123)).to.equal(-123);
    });

    it('when value is a zero', () => {
      expect(safeToLowerCase(0)).to.equal(0);
    });

    it('when value is a positive number', () => {
      expect(safeToLowerCase(123)).to.equal(123);
    });

    it('when value is `false`', () => {
      expect(safeToLowerCase(false)).to.equal(false);
    });

    it('when value is `true`', () => {
      expect(safeToLowerCase(true)).to.equal(true);
    });

    it('when value is an empty object', () => {
      expect(safeToLowerCase({})).to.eql({});
    });

    it('when value is an empty array', () => {
      expect(safeToLowerCase([])).to.eql([]);
    });

    it('when value is a non-empty array of numbers', () => {
      expect(safeToLowerCase([1, 2, 3])).to.eql([1, 2, 3]);
    });

    it('when value is a non-empty array of strings', () => {
      expect(safeToLowerCase(['1', 'string', 'false'])).to.eql(['1', 'string', 'false']);
    });

    it('when value is a function', () => {
      const fn = (a: number, b: number) => a * b;
      expect(safeToLowerCase(fn)).to.equal(fn);
    });
  });
});

describe('safeTrim', () => {
  describe('returns value trimmed', () => {
    it('when value is a lowercase string', () => {
      expect(safeTrim('  string  ')).to.equal('string');
    });

    it('when value is an uppercase string', () => {
      expect(safeTrim('  STRING  ')).to.equal('STRING');
    });

    it('when value is a mixed case string', () => {
      expect(safeTrim('  sTRiNG  ')).to.equal('sTRiNG');
    });
  });

  describe('returns value unaltered', () => {
    it('when value is a negative number', () => {
      expect(safeTrim(-123)).to.equal(-123);
    });

    it('when value is a zero', () => {
      expect(safeTrim(0)).to.equal(0);
    });

    it('when value is a positive number', () => {
      expect(safeTrim(123)).to.equal(123);
    });

    it('when value is `false`', () => {
      expect(safeTrim(false)).to.equal(false);
    });

    it('when value is `true`', () => {
      expect(safeTrim(true)).to.equal(true);
    });

    it('when value is an empty object', () => {
      expect(safeTrim({})).to.eql({});
    });

    it('when value is an empty array', () => {
      expect(safeTrim([])).to.eql([]);
    });

    it('when value is a non-empty array of numbers', () => {
      expect(safeTrim([1, 2, 3])).to.eql([1, 2, 3]);
    });

    it('when value is a non-empty array of strings', () => {
      expect(safeTrim([' 1 ', ' string ', ' false '])).to.eql([' 1 ', ' string ', ' false ']);
    });

    it('when value is a function', () => {
      const fn = (a: number, b: number) => a * b;
      expect(safeTrim(fn)).to.equal(fn);
    });
  });
});
