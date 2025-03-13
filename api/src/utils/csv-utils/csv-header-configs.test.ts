import { expect } from 'chai';
import { z } from 'zod';
import { CSVParams, CSVRowState } from './csv-config-validation.interface';
import {
  getDateRangeCellValidator,
  getDescriptionCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getLookupIdCellValidator,
  getNonEmptyStringCellValidator,
  getPositiveNumberCellValidator,
  getSurveyCritterAliasCellValidator,
  getTsnCellValidator,
  validateZodCell
} from './csv-header-configs';

describe('CSVHeaderConfigs', () => {
  describe('validateZodCell', () => {
    it('should return an empty array if the cell is valid', () => {
      const result = validateZodCell(123, z.number());
      expect(result).to.be.deep.equal([]);
    });

    it('should return an array of CSV error objects when invalid', () => {
      const result = validateZodCell('hi', z.number().min(0).max(0));
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
      const descriptionValidator = getDescriptionCellValidator({ optional: true });

      const validDescriptions = ['description', '1', 1, undefined, ' test'];

      for (const validDescription of validDescriptions) {
        const result = descriptionValidator({
          cell: validDescription,
          row: {},
          header: 'HEADER',
          rowIndex: 0,
          mutateCell: 'description'
        });

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when invalid', () => {
      const badDescriptions = ['', null, ' '];

      for (const badDescription of badDescriptions) {
        const descriptionValidator = getDescriptionCellValidator({ optional: true });

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

  describe('getLatitudeCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const latitudeValidator = getLatitudeCellValidator({ optional: false });

      const values = [1.234, -1.234, 0, -90, 90];

      for (const value of values) {
        const result = latitudeValidator({ cell: value } as CSVParams);

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when invalid', () => {
      const latitudeValidator = getLatitudeCellValidator({ optional: false });

      const badValues = [-91, 91, 'string', null, undefined];

      for (const badValue of badValues) {
        const result = latitudeValidator({ cell: badValue } as CSVParams);

        expect(result.length).to.be.equal(1);
      }
    });

    it('should return an empty array if the cell is optional and undefined', () => {
      const latitudeValidator = getLatitudeCellValidator({ optional: true });

      const result = latitudeValidator({ cell: undefined } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });
  });

  describe('getLongitudeCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const longitudeValidator = getLongitudeCellValidator({ optional: false });

      const values = [1.234, -1.234, 0, -180, 180];

      for (const value of values) {
        const result = longitudeValidator({ cell: value } as CSVParams);

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when invalid', () => {
      const longitudeValidator = getLongitudeCellValidator({ optional: false });

      const badValues = [-181, 181, 'string', null, undefined];

      for (const badValue of badValues) {
        const result = longitudeValidator({ cell: badValue } as CSVParams);

        expect(result.length).to.be.equal(1);
      }
    });

    it('should return an empty array if the cell is optional and undefined', () => {
      const longitudeValidator = getLongitudeCellValidator({ optional: true });

      const result = longitudeValidator({ cell: undefined } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });
  });

  describe('getSurveyCritterAliasCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const surveyCritterAliasValidator = getSurveyCritterAliasCellValidator(
        new Map([['alias', { critter_id: 'uuid' }]]) as any
      );

      const result = surveyCritterAliasValidator({
        cell: 'alias',
        row: {},
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'alias'
      });

      expect(result).to.be.deep.equal([]);
    });

    it('should return an error when the cell is not in the survey alias map', () => {
      const surveyCritterAliasValidator = getSurveyCritterAliasCellValidator(new Map() as any);

      const result = surveyCritterAliasValidator({
        cell: 'alias',
        row: {},
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'alias'
      });

      expect(result.length).to.be.equal(1);
    });

    it('should update the row state to store the critter ID', () => {
      const surveyCritterAliasValidator = getSurveyCritterAliasCellValidator(
        new Map([['alias', { critter_id: 'uuid' }]]) as any
      );

      const params = {
        cell: 'alias',
        row: {},
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'alias'
      };

      surveyCritterAliasValidator(params);
      expect(params.row[CSVRowState]?.critterId).to.be.equal('uuid');
    });
  });

  describe('getPositiveNumberCellValidator', () => {
    it('should return an empty array if the cell is optional and undefined', () => {
      const positiveNumberValidator = getPositiveNumberCellValidator({ optional: true });

      const result = positiveNumberValidator({ cell: undefined } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });

    it('should return an empty array if the cell is valid', () => {
      const positiveNumberValidator = getPositiveNumberCellValidator({ optional: false });

      const values = [1, 0.1, 100];

      for (const value of values) {
        const result = positiveNumberValidator({ cell: value } as CSVParams);

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when invalid', () => {
      const positiveNumberValidator = getPositiveNumberCellValidator({ optional: false });

      const badValues = [0, -1, -0.1, 'string', null, undefined];

      for (const badValue of badValues) {
        const result = positiveNumberValidator({ cell: badValue } as CSVParams);

        expect(result.length).to.be.equal(1);
      }
    });
  });

  describe('getNonEmptyStringCellValidator', () => {
    it('should return an empty array if the cell is optional and undefined', () => {
      const nonEmptyStringValidator = getNonEmptyStringCellValidator({ optional: true });

      const result = nonEmptyStringValidator({ cell: undefined } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });

    it('should return an empty array if the cell is optional and undefined', () => {
      const nonEmptyStringValidator = getNonEmptyStringCellValidator({ optional: true });

      const result = nonEmptyStringValidator({ cell: undefined } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });

    it('should return an empty array if the cell is valid', () => {
      const nonEmptyStringValidator = getNonEmptyStringCellValidator({ optional: false });

      const values = ['string', '0', '0.1', ' test'];

      for (const value of values) {
        const result = nonEmptyStringValidator({ cell: value } as CSVParams);

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when invalid', () => {
      const nonEmptyStringValidator = getNonEmptyStringCellValidator({ optional: false });

      const badValues = ['', ' ', null, undefined];

      for (const badValue of badValues) {
        const result = nonEmptyStringValidator({ cell: badValue } as CSVParams);

        expect(result.length).to.be.equal(1);
      }
    });
  });

  describe('getDateRangeCellValidator', () => {
    it('should return an empty array when the cell is valid (timestamps)', () => {
      const dateRangeValidator = getDateRangeCellValidator({ optional: false });
      const result = dateRangeValidator({ cell: '2021-01-01 10:10:10 - 2021-01-02 10:10:10' } as CSVParams);
      expect(result).to.be.deep.equal([]);
    });

    it('should return an empty array if the cell is valid', () => {
      const dateRangeValidator = getDateRangeCellValidator({ optional: false });
      const result = dateRangeValidator({ cell: '2021-01-01 - 2021-01-02' } as CSVParams);
      expect(result).to.be.deep.equal([]);
    });

    it('should return a single error when invalid', () => {
      const dateRangeValidator = getDateRangeCellValidator({ optional: false });
      const result = dateRangeValidator({ cell: '2021-01-01 - 2021-01-02 - 2021-01-03' } as CSVParams);
      expect(result.length).to.be.equal(1);
    });

    it('shoud return an empty array if the cell is optional and undefined', () => {
      const dateRangeValidator = getDateRangeCellValidator({ optional: true });
      const result = dateRangeValidator({ cell: undefined } as CSVParams);
      expect(result).to.be.deep.equal([]);
    });
  });

  describe('getLookupIdCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const values = [{ name: 'name', id: 'id' }];
      const lookupIdValidator = getLookupIdCellValidator(values, {
        optional: false,
        getError: () => 'error',
        getSolution: () => 'solution'
      });

      const result = lookupIdValidator({ cell: 'invalid' } as CSVParams);

      expect(result.length).to.be.equal(1);
      expect(result[0].error).to.be.equal('error');
      expect(result[0].solution).to.be.equal('solution');
    });

    it('should return an empty array if the cell is optional and undefined', () => {
      const values = [{ name: 'name', id: 'id' }];
      const lookupIdValidator = getLookupIdCellValidator(values, {
        optional: true,
        getError: () => 'error',
        getSolution: () => 'solution'
      });

      const result = lookupIdValidator({ cell: undefined } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });

    it('should return an error when the cell is invalid', () => {
      const values = [{ name: 'name', id: 'id' }];
      const lookupIdValidator = getLookupIdCellValidator(values, {
        optional: false,
        getError: () => 'error',
        getSolution: () => 'solution'
      });

      const result = lookupIdValidator({ cell: 'invalid' } as CSVParams);

      expect(result.length).to.be.equal(1);
      expect(result[0].error).to.be.equal('error');
    });
  });
});
