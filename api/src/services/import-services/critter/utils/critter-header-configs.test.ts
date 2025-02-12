import { expect } from 'chai';
import xlsx from 'xlsx';
import { CSVConfigUtils } from '../../../../utils/csv-utils/csv-config-utils';
import { CSVConfig, CSVRowState } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../../utils/nested-record';
import { CritterCSVStaticHeader } from '../import-critters-service';
import {
  getCritterAliasCellValidator,
  getCritterCollectionUnitCellValidator,
  getCritterSexCellValidator,
  getWlhIDCellValidator
} from './critter-header-configs';

const mockConfig: CSVConfig<CritterCSVStaticHeader> = {
  staticHeadersConfig: {
    SPECIES: { aliases: ['TAXON', 'SPECIES', 'TSN'] },
    ALIAS: { aliases: ['NICKNAME', 'NAME', 'ANIMAL_ID'] },
    SEX: { aliases: [], optional: true },
    WLH_ID: { aliases: ['WILDLIFE_HEALTH_ID', 'WILD LIFE HEALTH ID', 'WLHID'], optional: true },
    DESCRIPTION: { aliases: ['COMMENTS', 'COMMENT', 'NOTES'], optional: true }
  },
  ignoreDynamicHeaders: false
};

describe('critter-header-configs', () => {
  describe('getCritterAliasCellValidator', () => {
    it('should return a single error when cell value is invalid', () => {
      const badCellValues = [null, undefined, '', ' ', {}];
      for (const badCellValue of badCellValues) {
        const critterAliasValidator = getCritterAliasCellValidator(
          new Set(),
          new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig)
        );

        const result = critterAliasValidator({
          cell: badCellValue,
          row: {},
          header: 'ALIAS',
          rowIndex: 0,
          mutateCell: badCellValue
        });

        expect(result.length).to.be.equal(1);
      }
    });

    it('should return an empty array if the cell is valid', () => {
      const mockWorksheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias1' }, { ALIAS: 'alias2' }, { ALIAS: 'alias3' }]);
      const surveyAliases = new Set(['alias1', 'alias2']);
      const configUtils = new CSVConfigUtils(mockWorksheet, mockConfig);

      const critterAliasValidator = getCritterAliasCellValidator(surveyAliases, configUtils);

      const result = critterAliasValidator({
        cell: 'alias4',
        row: {},
        header: 'ALIAS',
        rowIndex: 0,
        mutateCell: 'alias4'
      });

      expect(result).to.be.deep.equal([]);
    });

    it('should return single error when cell value already exists in survey aliases', () => {
      const mockWorksheet = xlsx.utils.json_to_sheet([{ ALIAS: 'alias1' }, { ALIAS: 'alias2' }, { ALIAS: 'alias3' }]);
      const surveyAliases = new Set(['alias1', 'alias2']);
      const configUtils = new CSVConfigUtils(mockWorksheet, mockConfig);

      const critterAliasValidator = getCritterAliasCellValidator(surveyAliases, configUtils);

      const result = critterAliasValidator({
        cell: 'alias1',
        row: {},
        header: 'ALIAS',
        rowIndex: 0,
        mutateCell: 'alias1'
      });

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

      const result = critterAliasValidator({
        cell: 'alias3',
        row: {},
        header: 'ALIAS',
        rowIndex: 0,
        mutateCell: 'alias3'
      });

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
      const cellValidator = getCritterCollectionUnitCellValidator(
        new NestedRecord({
          1: {
            HEADER: {
              unit: 'uuid'
            }
          }
        })
      );

      const cellValues = ['unit', undefined];

      for (const cell of cellValues) {
        const result = cellValidator({
          cell: cell,
          row: { SPECIES: 1, [CSVRowState]: { itis_tsn: 1 } },
          header: 'HEADER',
          rowIndex: 0,
          mutateCell: cell
        });

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when the tsn has no collection units', () => {
      const cellValidator = getCritterCollectionUnitCellValidator(
        new NestedRecord({
          1: {
            HEADER: {
              unit: 'uuid'
            }
          }
        })
      );

      const result = cellValidator({
        cell: 'unit',
        row: { SPECIES: 2, [CSVRowState]: { itis_tsn: 2 } },
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'unit'
      });

      expect(result[0].error).to.be.equal('Collection units not found for TSN: 2');
    });

    it('should return a single error when collection unit header invalid', () => {
      const cellValidator = getCritterCollectionUnitCellValidator(
        new NestedRecord({
          1: {
            HEADER: {
              unit: 'uuid'
            }
          }
        })
      );

      const result = cellValidator({
        cell: 'unit',
        row: { SPECIES: 1, [CSVRowState]: { itis_tsn: 1 } },
        header: 'HEADER2',
        rowIndex: 0,
        mutateCell: 'unit'
      });

      expect(result[0].error).to.be.equal('Invalid collection category header');
    });

    it('should return a single error when collection unit value invalid', () => {
      const cellValidator = getCritterCollectionUnitCellValidator(
        new NestedRecord({
          1: {
            HEADER: {
              unit: 'uuid'
            }
          }
        })
      );

      const result = cellValidator({
        cell: 'unit2',
        row: { SPECIES: 1, [CSVRowState]: { itis_tsn: 1 } },
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'unit2'
      });

      expect(result[0].error).to.be.equal('Invalid collection unit cell value');
    });
  });

  describe('getCritterSexCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const cellValidator = getCritterSexCellValidator(
        new NestedRecord({
          1: {
            male: 'uuid'
          }
        })
      );

      const cellValues = ['male', 'MALE', undefined];

      for (const cell of cellValues) {
        const result = cellValidator({
          cell: cell,
          row: { SPECIES: 1, [CSVRowState]: { itis_tsn: 1 } },
          header: 'HEADER',
          rowIndex: 0,
          mutateCell: cell
        });

        expect(result).to.be.deep.equal([]);
      }
    });

    it('should return a single error when the cell value is invalid', () => {
      const cellValidator = getCritterSexCellValidator(
        new NestedRecord({
          1: {
            male: 'uuid'
          }
        })
      );

      const cellValues = ['', 0];

      for (const cell of cellValues) {
        const result = cellValidator({
          cell: cell,
          row: { SPECIES: 1, [CSVRowState]: { itis_tsn: 1 } },
          header: 'HEADER',
          rowIndex: 0,
          mutateCell: cell
        });

        expect(result.length).to.be.equal(1);
      }
    });

    it('should return a single error when rowDictionary has no reference to TSN', () => {
      const cellValidator = getCritterSexCellValidator(
        new NestedRecord({
          1: {
            male: 'uuid'
          }
        })
      );

      const result = cellValidator({
        cell: 'male',
        row: { SPECIES: 2, [CSVRowState]: { itis_tsn: 2 } },
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'male'
      });

      expect(result[0].error).to.be.equal('Sex is not a supported attribute for TSN: 2');
    });

    it('should return a single error when rowDictionary has no reference to sex value', () => {
      const cellValidator = getCritterSexCellValidator(
        new NestedRecord({
          1: {
            male: 'uuid'
          }
        })
      );

      const result = cellValidator({
        cell: 'maled',
        row: { SPECIES: 1, [CSVRowState]: { itis_tsn: 1 } },
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: 'maled'
      });

      expect(result[0].error).to.be.equal('Sex cell value is invalid');
    });
  });

  describe('getWlhIDCellValidator', () => {
    it('should return an empty array if the cell is valid', () => {
      const wlhIDValidator = getWlhIDCellValidator(new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig));

      const result = wlhIDValidator({
        cell: '10-01111',
        row: {},
        header: 'HEADER',
        rowIndex: 0,
        mutateCell: '10-01111'
      });

      expect(result).to.be.deep.equal([]);
    });

    it('should return no errors when cell is undefined', () => {
      const wlhIDValidator = getWlhIDCellValidator(new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig));

      const result = wlhIDValidator({ cell: undefined, row: {}, header: 'HEADER', rowIndex: 0, mutateCell: undefined });

      expect(result).to.be.deep.equal([]);
    });

    it('should return single error when cell value does not pass regex', () => {
      const wlhIDValidator = getWlhIDCellValidator(new CSVConfigUtils(xlsx.utils.json_to_sheet([]), mockConfig));

      const badWlhIds = ['100111', '1-011111', '100-222', '21-'];

      badWlhIds.forEach((badWlhId) => {
        const result = wlhIDValidator({ cell: badWlhId, row: {}, header: 'HEADER', rowIndex: 0, mutateCell: badWlhId });

        expect(result).to.be.deep.equal([
          {
            error: `Invalid Wildlife Health ID format`,
            solution: `Update the Wildlife Health ID to match the expected format 'XX-XXXX'`
          }
        ]);
      });
    });
  });
});
