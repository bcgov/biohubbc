import { get } from 'lodash';
import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellSetter, CSVCellValidator, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { validateZodCell } from '../../../utils/csv-utils/csv-header-configs';
import { CritterCSVConfig } from './import-critters-service';

/**
 * Get the critter alias cell validator.
 *
 * Rules:
 *  1. The cell must be a string with a length between 1 and 50
 *  2. The cell must be unique in the survey
 *  3. The cell must be unique in the CSV
 *
 * @param {Set<string>} surveyAliases The survey aliases.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCritterAliasCellValidator = (
  surveyAliases: Set<string>,
  configUtils: CSVConfigUtils<CritterCSVConfig>
): CSVCellValidator => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string().trim().min(1).max(50));
    const isAliasUnique = configUtils.isCellUnique('ALIAS', params.cell);

    if (cellErrors.length) {
      return cellErrors;
    }

    // Check if the alias already exists in the survey
    if (surveyAliases.has(String(params.cell))) {
      cellErrors.push({
        error: `Critter alias already exists in the Survey`,
        solution: `Update the alias to be unique`
      });
    }

    // Check if the alias already exists in the CSV
    if (!isAliasUnique) {
      cellErrors.push({
        error: `Critter alias already exists in the CSV`,
        solution: `Update the alias to be unique`
      });
    }

    return cellErrors;
  };
};

/**
 * Get the critter collection unit cell validator.
 *
 * Rules:
 *  1. The header must be a valid collection category for the TSN
 *  2. The cell value must be a valid collection unit for the collection category
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCritterCollectionUnitCellValidator = (
  rowDictionary: { [tsn: number]: { [header: string]: { [unit: string]: string } } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    // The row TSN value
    const rowTsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));

    // The collection unit cell value
    const collectionUnitCellValue = String(params.cell).toLowerCase();

    // The collection category (for clarity)
    const collectionCategory = params.header;

    const rowDictionaryTsn = get(rowDictionary, rowTsn);

    // Check if the row TSN has collection units
    if (!rowDictionaryTsn) {
      return [
        {
          error: `Collection units not found for TSN: ${rowTsn}`,
          solution: `Validate TSN is correct and has collection units`
        }
      ];
    }

    const rowDictionaryCategory = get(rowDictionary, [rowTsn, collectionCategory]);

    // Check if the dynamic header is a valid collection category for the TSN
    if (!rowDictionaryCategory) {
      return [
        {
          error: `Invalid collection category header`,
          solution: `Use valid collection unit category header`,
          values: Object.keys(rowDictionaryTsn)
        }
      ];
    }

    const rowDictionaryUnit = get(rowDictionary, [rowTsn, collectionCategory, collectionUnitCellValue]);

    // Check if the cell value is a valid collection unit for the collection category
    if (!rowDictionaryUnit) {
      return [
        {
          error: `Invalid collection unit cell value`,
          solution: `Use valid collection unit cell value`,
          values: Object.keys(rowDictionaryCategory)
        }
      ];
    }

    return [];
  };
};

/**
 * Get the collection unit cell setter.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {CSVCellSetter} The set cell value callback
 */
export const getCritterCollectionUnitCellSetter = (
  rowDictionary: { [tsn: number]: { [header: string]: { [unit: string]: string } } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): CSVCellSetter => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return undefined;
    }

    const tsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const unit = String(params.cell).toLowerCase();

    return get(rowDictionary, [tsn, params.header, unit]);
  };
};

/**
 * Get the critter sex cell validator.
 *
 * Rules:
 *  1. The TSN must have sex measurements available
 *  2. The cell value must be a valid sex option for the TSN
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCritterSexCellValidator = (
  rowDictionary: { [tsn: number]: { [sex: string]: string } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): CSVCellValidator => {
  return (params: CSVParams) => {
    const rowTsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const sexCellValue = String(params.cell).toLowerCase();

    const rowDictionaryTsn = get(rowDictionary, rowTsn);

    // Check if the row TSN has sex measurements available
    if (!rowDictionaryTsn) {
      return [
        {
          error: `Sex is not a supported attribute for TSN: ${rowTsn}`,
          solution: `Use a valid TSN that supports sex, or contact a system administrator to add additional sex values.`
        }
      ];
    }

    const rowDictionarySex = get(rowDictionary, [rowTsn, sexCellValue]);

    // Check if the cell value is a valid sex measurement for the TSN
    if (!rowDictionarySex) {
      return [
        {
          error: `Sex cell value is invalid`,
          solution: `Use valid sex option`,
          values: Object.keys(rowDictionaryTsn)
        }
      ];
    }

    return [];
  };
};

/**
 * Get the critter sex cell setter.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CrittterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCritterSexCellSetter = (
  rowDictionary: { [tsn: number]: { [sex: string]: string } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): CSVCellSetter => {
  return (params: CSVParams) => {
    const tsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const cellValue = String(params.cell).toLowerCase();

    return get(rowDictionary, [tsn, cellValue]);
  };
};
