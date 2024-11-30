import { expect } from 'chai';
import xlsx from 'xlsx';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVConfig } from '../../../utils/csv-utils/csv-config-validation.interface';
import {
  getCritterAliasCellValidator,
  getCritterCollectionUnitCellSetter,
  getCritterCollectionUnitCellValidator,
  getCritterSexCellSetter,
  getCritterSexCellValidator
} from './critter-header-configs';

const mockConfig: CSVConfig = {
  staticHeadersConfig: {
    ALIAS: { aliases: [] }
  },
  ignoreDynamicHeaders: true
};

describe('critter-header-configs', () => {
  describe('getCritterAliasCellValidator', () => {
    it('should return a single error when cell value is invalid', () => {
      const badCellValues = [null, undefined, '', ' ', 0, {}];
      for (const badCellValue of badCellValues) {
        const critterAliasValidator = getCritterAliasCellValidator(
          new Set(),
          new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
        );

        const result = critterAliasValidator({ cell: badCellValue, row: {}, header: 'ALIAS', rowIndex: 0 });

        expect(result.length).to.be.equal(1);
      }
    });

    it.only('should return an empty array if the cell is valid', () => {
      const mockWorksheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias1' }, { ALIAS: 'alias2' }, { ALIAS: 'alias3' }]);
      const surveyAliases = new Set(['alias1', 'alias2']);
      const configUtils = new CSVConfigUtils(mockWorksheet, mockConfig);

      const critterAliasValidator = getCritterAliasCellValidator(surveyAliases, configUtils);

      const result = critterAliasValidator({ cell: 'alias4', row: {}, header: 'ALIAS', rowIndex: 0 });

      expect(result).to.be.deep.equal([]);
    });

    it('should return single error when cell value already exists in survey aliases', () => {
      const mockWorksheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias1' }, { ALIAS: 'alias2' }, { ALIAS: 'alias3' }]);
      const surveyAliases = new Set(['alias1', 'alias2']);
      const configUtils = new CSVConfigUtils(mockWorksheet, mockConfig);

      const critterAliasValidator = getCritterAliasCellValidator(surveyAliases, configUtils);

      const result = critterAliasValidator({ cell: 'alias1', row: {}, header: 'ALIAS', rowIndex: 0 });

      expect(result).to.be.deep.equal([
        {
          error: 'Critter alias already exists in the Survey',
          solution: 'Update the alias to be unique'
        }
      ]);
    });

    it('should return single error when cell value already exists in row aliases', () => {
      const mockWorksheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias1' }, { ALIAS: 'alias3' }, { ALIAS: 'alias3' }]);
      const surveyAliases = new Set(['alias1', 'alias2']);
      const configUtils = new CSVConfigUtils(mockWorksheet, mockConfig);

      const critterAliasValidator = getCritterAliasCellValidator(surveyAliases, configUtils);

      const result = critterAliasValidator({ cell: 'alias3', row: {}, header: 'ALIAS', rowIndex: 0 });

      expect(result).to.be.deep.equal([
        {
          error: 'Critter alias already exists in the CSV',
          solution: 'Update the alias to be unique'
        }
      ]);
    });
  });

  describe('getCritterCollectionUnitCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const rowDictionary = {
        1: {
          HEADER: {
            unit: 'uuid'
          }
        }
      };
      const cellValidator = getCritterCollectionUnitCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const cellValues = ['unit', undefined];

      for (const cell of cellValues) {
        const result = cellValidator({ cell: cell, row: { ITIS_TSN: 1 }, header: 'HEADER', rowIndex: 0 });

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when the tsn has no collection units', () => {
      const rowDictionary = {
        1: {
          HEADER: {
            unit: 'uuid'
          }
        }
      };
      const cellValidator = getCritterCollectionUnitCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellValidator({ cell: 'unit', row: { ITIS_TSN: 2 }, header: 'HEADER', rowIndex: 0 });

      expect(result[0].error).to.be.equal('Collection units not found for TSN: 2');
    });

    it('should return a single error when collection unit header invalid', () => {
      const rowDictionary = {
        1: {
          HEADER: {
            unit: 'uuid'
          }
        }
      };
      const cellValidator = getCritterCollectionUnitCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellValidator({ cell: 'unit', row: { ITIS_TSN: 1 }, header: 'HEADER2', rowIndex: 0 });

      expect(result[0].error).to.be.equal('Invalid collection category header');
    });

    it('should return a single error when collection unit value invalid', () => {
      const rowDictionary = {
        1: {
          HEADER: {
            unit: 'uuid'
          }
        }
      };
      const cellValidator = getCritterCollectionUnitCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellValidator({ cell: 'unit2', row: { ITIS_TSN: 1 }, header: 'HEADER', rowIndex: 0 });

      expect(result[0].error).to.be.equal('Invalid collection unit cell value');
    });
  });

  describe('getCritterCollectionUnitSetter', () => {
    it('should return undefined when cell value is falsy', () => {
      const cellSetter = getCritterCollectionUnitCellSetter(
        {},
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellSetter({ cell: '', row: {}, header: 'HEADER', rowIndex: 0 });

      expect(result).to.be.equal(undefined);
    });

    it('should return the uuid', () => {
      const rowDictionary = {
        1: {
          HEADER: {
            unit: 'uuid'
          }
        }
      };
      const cellSetter = getCritterCollectionUnitCellSetter(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellSetter({ cell: 'unit', row: { ITIS_TSN: 1 }, header: 'HEADER', rowIndex: 0 });

      expect(result).to.be.equal('uuid');
    });
  });

  describe('getCritterSexCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const rowDictionary = {
        1: {
          male: 'uuid'
        }
      };
      const cellValidator = getCritterSexCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const cellValues = ['male', 'MALE'];

      for (const cell of cellValues) {
        const result = cellValidator({ cell: cell, row: { ITIS_TSN: 1 }, header: 'HEADER', rowIndex: 0 });

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when the cell value is invalid', () => {
      const rowDictionary = {
        1: {
          male: 'uuid'
        }
      };
      const cellValidator = getCritterSexCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const cellValues = [undefined, '', 0];

      for (const cell of cellValues) {
        const result = cellValidator({ cell: cell, row: { ITIS_TSN: 1 }, header: 'HEADER', rowIndex: 0 });

        expect(result.length).to.be.equal(1);
      }
    });

    it('should return a single error when rowDictionary has no reference to TSN', () => {
      const rowDictionary = {
        1: {
          male: 'uuid'
        }
      };
      const cellValidator = getCritterSexCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellValidator({ cell: 'male', row: { ITIS_TSN: 2 }, header: 'HEADER', rowIndex: 0 });

      expect(result[0].error).to.be.equal('Sex is not a supported attribute for TSN: 2');
    });

    it('should return a single error when rowDictionary has no reference to sex value', () => {
      const rowDictionary = {
        1: {
          male: 'uuid'
        }
      };
      const cellValidator = getCritterSexCellValidator(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellValidator({ cell: 'maled', row: { ITIS_TSN: 1 }, header: 'HEADER', rowIndex: 0 });

      expect(result[0].error).to.be.equal('Sex cell value is invalid');
    });
  });

  describe('getCritterSexCellSetter', () => {
    it('should return the uuid', () => {
      const rowDictionary = {
        1: {
          male: 'uuid'
        }
      };
      const cellSetter = getCritterSexCellSetter(
        rowDictionary,
        new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
      );

      const result = cellSetter({ cell: 'MALE', row: { ITIS_TSN: 1 }, header: 'HEADER', rowIndex: 0 });

      expect(result).to.be.equal('uuid');
    });
  });
});
