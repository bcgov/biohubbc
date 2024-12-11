import { expect } from 'chai';
import { z } from 'zod';
import { getDescriptionCellValidator, getTsnCellValidator, validateZodCell } from './csv-header-configs';

describe('CSVHeaderConfigs', () => {
  describe('validateZodCell', () => {
    it('should return an empty array if the cell is valid', () => {
      const result = validateZodCell({ cell: 123 } as any, z.number());
      expect(result).to.be.deep.equal([]);
    });

    it('should return an array of CSV error objects when invalid', () => {
      const result = validateZodCell({ cell: 'hi', header: 'HEADER', rowIndex: 0 } as any, z.number().min(0).max(0));
      expect(result).to.be.deep.equal([
        {
          error: 'Expected number, received string',
          solution: 'Update the cell value to match the expected type'
        }
      ]);
    });
  });

  describe('getTsnCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const tsns = new Set([1, 2]);
      const tsnValidator = getTsnCellValidator(tsns);

      const result = tsnValidator({ cell: 1, row: {}, header: 'HEADER', rowIndex: 0, mutateCell: 1 });

      expect(result).to.be.deep.equal([]);
    });

    it('should return single error when cell value not included in TSNs', () => {
      const tsns = new Set([1, 2]);
      const tsnValidator = getTsnCellValidator(tsns);

      const result = tsnValidator({ cell: 3, row: {}, header: 'HEADER', rowIndex: 0, mutateCell: 3 });

      expect(result).to.be.deep.equal([
        {
          error: `Did not receive a Taxonomic Serial Number (TSN) for the species`,
          solution: `Use a valid Taxonomic Serial Number (TSN) instead of a name to reference species.`
        }
      ]);
    });
  });

  describe('getDescriptionCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const descriptionValidator = getDescriptionCellValidator();

      const result = descriptionValidator({
        cell: 'description',
        row: {},
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'description'
      });

      expect(result).to.be.deep.equal([]);
    });

    it('should return a single error when invalid', () => {
      const badDescriptions = ['', 2, null, ' '];

      for (const badDescription of badDescriptions) {
        const descriptionValidator = getDescriptionCellValidator();

        const result = descriptionValidator({
          cell: badDescription,
          row: {},
          header: 'HEADER',
          rowIndex: 0,
          mutateCell: badDescription
        });

        expect(result.length).to.be.equal(1);
      }
    });
  });
});
