import { expect } from 'chai';
import { generateCellValueGetter } from './column-cell-utils';

describe('column-validators', () => {
  describe('generateCellValueGetter', () => {
    it('should return value if property exists in object', () => {
      const getValue = generateCellValueGetter(['test', 'property']);
      const object = { property: true };
      expect(getValue(object)).to.be.true;
    });

    it('should return undefined if property does not exist in object', () => {
      const getValue = generateCellValueGetter(['test', 'property']);
      const object = { bad: true };
      expect(getValue(object)).to.be.undefined;
    });
  });
});
