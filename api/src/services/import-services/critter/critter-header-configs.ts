import { countBy, get } from 'lodash';
import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVError, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getCSVParamsError, validateZodCell } from '../../../utils/csv-utils/csv-header-configs';
import { CritterCSVConfig } from './import-critters-service';

/**
 * Get the critter alias cell validator.
 *
 * @param {Set<string>} surveyAliases The survey aliases.
 * @param {CSVConfigUtils<CritterCSVConfig>} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getCritterAliasCellValidator = (
  surveyAliases: Set<string>,
  configUtils: CSVConfigUtils<CritterCSVConfig>
): ((params: CSVParams) => CSVError[]) => {
  const rowAliases = configUtils.getCellValues('ALIAS');
  const rowAliasCounts = countBy(rowAliases.map((alias) => String(alias).toLowerCase()));

  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string().trim().min(1).max(50));

    if (cellErrors.length) {
      return cellErrors;
    }

    if (surveyAliases.has(String(params.cell))) {
      cellErrors.push({
        error: `Critter alias already exists in the Survey`,
        solution: `Update the alias to be unique`,
        ...getCSVParamsError(params)
      });
    }

    if (rowAliasCounts[String(params.cell).toLowerCase()] > 1) {
      cellErrors.push({
        error: `Critter alias already exists in the CSV`,
        solution: `Update the alias to be unique`,
        ...getCSVParamsError(params)
      });
    }

    return cellErrors;
  };
};

/**
 * Get the critter collection unit cell validator.
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
    const cellErrors = validateZodCell(params, z.string().trim().min(1).max(50).optional());

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
        solution: `Validate TSN is correct and has collection units`,
        ...getCSVParamsError(params)
      });
    } else if (!rowDictionaryHeader) {
      cellErrors.push({
        error: `Invalid collection category header`,
        solution: `Use valid collection unit category header`,
        values: Object.keys(rowDictionaryTsn),
        ...getCSVParamsError(params)
      });
    } else if (!rowDictionaryUnit) {
      cellErrors.push({
        error: `Invalid collection unit cell value`,
        solution: `Use valid collection unit cell value`,
        values: Object.keys(rowDictionaryHeader),
        ...getCSVParamsError(params)
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
        solution: `Use a valid TSN that supports sex, or contact a system administrator to add additional sex values.`,
        ...getCSVParamsError(params)
      });
    } else if (!rowDictionarySex) {
      cellErrors.push({
        error: `Sex cell value is invalid`,
        solution: `Use valid sex option`,
        values: Object.keys(rowDictionaryTsn),
        ...getCSVParamsError(params)
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
