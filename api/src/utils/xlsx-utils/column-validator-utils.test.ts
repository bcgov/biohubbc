import { expect } from 'chai';
import {
  generateColumnCellGetterFromColumnValidator,
  getColumnAliasesFromValidator,
  getColumnNamesFromValidator
} from './column-validator-utils';
import { IXLSXCSVValidator } from './worksheet-utils';

const columnValidator = {
  NAME: { type: 'string' },
  ID: { type: 'number', aliases: ['IDENTIFIER'] },
  AGE: { type: 'number' },
  BIRTH_DATE: { type: 'date' }
} satisfies IXLSXCSVValidator;

describe('column-validator-utils', () => {
  describe('getColumnNamesFromValidator', () => {
    it('should return all column names from validator', () => {
      expect(getColumnNamesFromValidator(columnValidator)).to.be.eql(['NAME', 'ID', 'AGE', 'BIRTH_DATE']);
    });
  });

  describe('getColumnAliasesFromValidator', () => {
    it('should return all column aliases from validator', () => {
      expect(getColumnAliasesFromValidator(columnValidator)).to.be.eql(['IDENTIFIER']);
    });
  });

  describe('generateColumnCellGetterFromColumnValidator', () => {
    const getCellValue = generateColumnCellGetterFromColumnValidator(columnValidator);

    it('should return the cell value for a known column name', () => {
      expect(getCellValue({ NAME: 'Dr. Steve Brule' }, 'NAME').cell).to.be.eql('Dr. Steve Brule');
    });

    it('should return the cell value for a known alias name', () => {
      expect(getCellValue({ IDENTIFIER: 1 }, 'ID').cell).to.be.eql(1);
    });

    it('should return undefined if row cannot find cell value', () => {
      expect(getCellValue({ BAD_NAME: 1 }, 'NAME').cell).to.be.eql(undefined);
    });

    it('should return column name', () => {
      expect(getCellValue({ NAME: 1 }, 'NAME').column).to.be.eql('NAME');
    });

    it('should return column alias name', () => {
      expect(getCellValue({ IDENTIFIER: 1 }, 'ID').column).to.be.eql('IDENTIFIER');
    });
  });
});
