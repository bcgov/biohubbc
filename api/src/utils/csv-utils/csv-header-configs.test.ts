import { expect } from 'chai';
import { z } from 'zod';
import { CSVParams, CSVRow, CSVRowState } from './csv-config-validation.interface';
import {
  getDescriptionCellValidator,
  getLatitudeCellValidator,
  getLongitudeCellValidator,
  getLookupIdCellValidator,
  getSurveyCritterAliasCellValidator,
  getTsnCellValidator,
  updateCSVRowState,
  validateZodCell
} from './csv-header-configs';

describe('CSVHeaderConfigs', () => {
  describe('updateRowState', () => {
    it('should create the state in the row and add the new value', () => {
      const row = { TEST: 'cellValue' };

      updateCSVRowState(row, { stateValue: 'value' });

      expect(row[CSVRowState]?.stateValue).to.equal('value');
    });

    it('should update the state in the row and add the new value', () => {
      const row = { TEST: 'cellValue', [CSVRowState]: { stateValue: 'oldValue' } };

      updateCSVRowState(row, { stateValue: 'newValue' });

      expect(row[CSVRowState]?.stateValue).to.equal('newValue');
    });

    it('should remove the state in the row', () => {
      const row = { TEST: 'cellValue', [CSVRowState]: { stateValue: 'oldValue' } };

      updateCSVRowState(row, { stateValue: undefined });

      expect(row[CSVRowState]?.stateValue).to.be.undefined;
    });

    it('should add additional state values', () => {
      const row: CSVRow = { TEST: 'cellValue', [CSVRowState]: { stateValue: 'oldValue' } };

      updateCSVRowState(row, { stateValue: 'newValue', additionalValue: 'value' });

      expect(row[CSVRowState]?.stateValue).to.equal('newValue');
      expect(row[CSVRowState]?.additionalValue).to.equal('value');
    });

    it('should set nested state values', () => {
      const row: CSVRow = { TEST: 'cellValue' };

      updateCSVRowState(row, { state: { value: 'newValue' } });

      expect(row[CSVRowState]?.state?.value).to.equal('newValue');
    });

    it('should update nested state values', () => {
      const row: CSVRow = { TEST: 'cellValue', [CSVRowState]: { state: { value: 'oldValue' } } };

      updateCSVRowState(row, { state: { value: 'newValue' } });

      expect(row[CSVRowState]?.state?.value).to.equal('newValue');
    });
  });

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

  describe('getLookupIdCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const values = [{ name: 'name', id: 'id' }];
      const lookupIdValidator = getLookupIdCellValidator(values, {
        optional: false,
        getError: () => 'error',
        getSolution: () => 'solution'
      });

      const result = lookupIdValidator({ cell: 'name' } as CSVParams);

      expect(result).to.be.deep.equal([]);
    });

    it('should return a single error when invalid', () => {
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
  });
});
