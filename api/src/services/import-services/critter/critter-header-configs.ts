import { get } from 'lodash';
import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVError, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
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
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getCritterAliasCellValidator = (
  surveyAliases: Set<string>,
  configUtils: CSVConfigUtils<CritterCSVConfig>
): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string().trim().min(1).max(50));
    const isAliasUnique = configUtils.isCellUnique('ALIAS', params.cell);

    if (cellErrors.length) {
      return cellErrors;
    }

    if (surveyAliases.has(String(params.cell))) {
      cellErrors.push({
        error: `Critter alias already exists in the Survey`,
        solution: `Update the alias to be unique`
      });
    }

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
 *  1. The cell must be a string with a max length of 50 or empty
 *  2. The header must be a valid collection category for the TSN
 *  3. The cell value must be a valid collection unit for the collection category
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getCritterCollectionUnitCellValidator = (
  rowDictionary: { [tsn: number]: { [header: string]: { [unit: string]: string } } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string().max(50).optional());

    if (cellErrors.length || !params.cell) {
      return cellErrors;
    }

    const rowTsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const cellValue = String(params.cell).toLowerCase();

    const rowDictionaryTsn = get(rowDictionary, rowTsn);
    const rowDictionaryHeader = get(rowDictionary, [rowTsn, params.header]);
    const rowDictionaryUnit = get(rowDictionary, [rowTsn, params.header, cellValue]);

    if (!rowDictionaryTsn) {
      cellErrors.push({
        error: `Collection units not found for TSN: ${rowTsn}`,
        solution: `Validate TSN is correct and has collection units`
      });
    } else if (!rowDictionaryHeader) {
      cellErrors.push({
        error: `Invalid collection category header`,
        solution: `Use valid collection unit category header`,
        values: Object.keys(rowDictionaryTsn)
      });
    } else if (!rowDictionaryUnit) {
      cellErrors.push({
        error: `Invalid collection unit cell value`,
        solution: `Use valid collection unit cell value`,
        values: Object.keys(rowDictionaryHeader)
      });
    }

    return cellErrors;
  };
};

/**
 * Get the collection unit cell setter.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => string | undefined} The set cell value callback
 */
export const getCritterCollectionUnitCellSetter = (
  rowDictionary: { [tsn: number]: { [header: string]: { [unit: string]: string } } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): ((params: CSVParams) => string | undefined) => {
  return (params: CSVParams) => {
    if (!params.cell) {
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
 *  1. The cell must be a string with a min length of 1 and max length of 50
 *  2. The TSN must have sex measurements available
 *  3. The cell value must be a valid sex option for the TSN
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getCritterSexCellValidator = (
  rowDictionary: { [tsn: number]: { [sex: string]: string } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string().trim().min(1).max(50));

    if (cellErrors.length) {
      return cellErrors;
    }

    const rowTsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const cellValue = String(params.cell).toLowerCase();

    const rowDictionaryTsn = get(rowDictionary, rowTsn);
    const rowDictionarySex = get(rowDictionary, [rowTsn, cellValue]);

    if (!rowDictionaryTsn) {
      cellErrors.push({
        error: `Sex is not a supported attribute for TSN: ${rowTsn}`,
        solution: `Use a valid TSN that supports sex, or contact a system administrator to add additional sex values.`
      });
    } else if (!rowDictionarySex) {
      cellErrors.push({
        error: `Sex cell value is invalid`,
        solution: `Use valid sex option`,
        values: Object.keys(rowDictionaryTsn)
      });
    }

    return cellErrors;
  };
};

/**
 * Get the critter sex cell setter.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils<CrittterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => string} The validate cell callback
 */
export const getCritterSexCellSetter = (
  rowDictionary: { [tsn: number]: { [sex: string]: string } },
  configUtils: CSVConfigUtils<CritterCSVConfig>
): ((params: CSVParams) => string) => {
  return (params: CSVParams) => {
    const tsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const cellValue = String(params.cell).toLowerCase();

    return get(rowDictionary, [tsn, cellValue]);
  };
};
