import { expect } from 'chai';
import { generateCellValueGetter, getColumnValidatorSpecification } from './column-cell-utils';
import { IXLSXCSVValidator } from './worksheet-utils';

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

  describe.only('getColumnValidatorSpecification', () => {
    it('should return specification format', () => {
      const columnValidator: IXLSXCSVValidator = {
        columnNames: ['TEST', 'COLUMN'],
        columnTypes: ['number', 'string'],
        columnAliases: {
          TEST: ['ALSO TEST'],
          COLUMN: ['ALSO COLUMN']
        }
      };

      const spec = getColumnValidatorSpecification(columnValidator);

      expect(spec).to.be.deep.equal([
        {
          columnName: 'TEST',
          columnType: 'number',
          columnAliases: ['ALSO TEST']
        },
        {
          columnName: 'COLUMN',
          columnType: 'string',
          columnAliases: ['ALSO COLUMN']
        }
      ]);
    });

    it('should return specification format without aliases if not defined', () => {
      const columnValidator: IXLSXCSVValidator = {
        columnNames: ['TEST'],
        columnTypes: ['number']
      };

      const spec = getColumnValidatorSpecification(columnValidator);

      expect(spec).to.be.deep.equal([
        {
          columnName: 'TEST',
          columnType: 'number'
        }
      ]);
    });
  });
});
