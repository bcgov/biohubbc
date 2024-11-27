import { countBy } from 'lodash';
import { z } from 'zod';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVError, CSVParams } from '../../../utils/csv-utils/csv-config-validation.interface';
import { validateZodCell } from '../../../utils/csv-utils/csv-header-configs';

/**
 * Get the critter alias cell validator.
 *
 * @param {Set<string>} surveyAliases The survey aliases.
 * @param {CSVConfigUtils} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getAliasCellValidator = (
  surveyAliases: Set<string>,
  configUtils: CSVConfigUtils
): ((params: CSVParams) => CSVError[]) => {
  const rowAliases = configUtils.getCellValues('ALIAS');
  const rowAliasCounts = countBy(rowAliases.map((alias) => String(alias).toLowerCase()));

  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string().max(50));

    if (cellErrors.length) {
      return cellErrors;
    }

    if (surveyAliases.has(String(params.cell))) {
      cellErrors.push({
        error: `Critter alias already exists in the Survey`,
        solution: `Update the alias to be unique`,
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    }

    if (rowAliasCounts[String(params.cell).toLowerCase()] > 1) {
      cellErrors.push({
        error: `Critter alias already exists in the CSV`,
        solution: `Update the alias to be unique`,
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    }

    return cellErrors;
  };
};

/**
 * Get the critter collection unit cell validator.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getCollectionUnitCellValidator = (
  rowDictionary: { [tsn: number]: { [header: string]: { [unit: string]: string } } },
  configUtils: CSVConfigUtils
): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string().max(50).optional());

    if (cellErrors.length || !params.cell) {
      return cellErrors;
    }

    const tsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const unit = String(params.cell).toLowerCase();

    if (!rowDictionary?.[tsn]) {
      cellErrors.push({
        error: `TSN: ${tsn} has no collection units`,
        solution: `Validate TSN is correct and has collection units`,
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    } else if (!rowDictionary[tsn]?.[params.header]) {
      cellErrors.push({
        error: `Invalid collection category header`,
        solution: `Use valid collection unit category header`,
        values: Object.keys(rowDictionary[tsn]),
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    } else if (!rowDictionary[tsn][params.header]?.[unit]) {
      cellErrors.push({
        error: `Invalid collection unit cell value`,
        solution: `Use valid collection unit cell value`,
        values: Object.keys(rowDictionary[tsn][params.header]),
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    }

    return cellErrors;
  };
};

/**
 * Get the collection unit cell setter.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => string | undefined} The set cell value callback
 */
export const getCollectionUnitCellSetter = (
  rowDictionary: { [tsn: number]: { [header: string]: { [unit: string]: string } } },
  configUtils: CSVConfigUtils
): ((params: CSVParams) => string | undefined) => {
  return (params: CSVParams) => {
    if (!params.cell) {
      return undefined;
    }

    const tsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const unit = String(params.cell).toLowerCase();

    return String(rowDictionary[tsn][params.header][unit]);
  };
};

/**
 * Get the critter sex cell validator.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => CSVError[]} The validate cell callback
 */
export const getSexCellValidator = (
  rowDictionary: { [tsn: number]: { [sex: string]: string } },
  configUtils: CSVConfigUtils
): ((params: CSVParams) => CSVError[]) => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params, z.string());

    if (cellErrors.length) {
      return cellErrors;
    }

    const rowTsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const cellValue = String(params.cell).toLowerCase();

    if (!rowDictionary?.[rowTsn]) {
      cellErrors.push({
        error: `Sex is not a supported attribute for TSN: ${rowTsn}`,
        solution: `Use a valid TSN that supports sex, or contact a system administrator to add additional sex values.`,
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    } else if (!rowDictionary[rowTsn]?.[cellValue]) {
      cellErrors.push({
        error: `Sex option invalid`,
        solution: `Use valid sex option`,
        values: Object.keys(rowDictionary[rowTsn]),
        cell: params.cell,
        header: params.header,
        rowIndex: params.rowIndex
      });
    }

    return cellErrors;
  };
};

/**
 * Get the critter sex cell setter.
 *
 * @param {Object} rowDictionary The row dictionary.
 * @param {CSVConfigUtils} configUtils The CSV config utils.
 * @returns {*} {(params: CSVParams) => string} The validate cell callback
 */
export const getSexCellSetter = (
  rowDictionary: { [tsn: number]: { [sex: string]: string } },
  configUtils: CSVConfigUtils
): ((params: CSVParams) => string) => {
  return (params: CSVParams) => {
    const tsn = Number(configUtils.getCellValue('ITIS_TSN', params.row));
    const cellValue = String(params.cell).toLowerCase();

    return rowDictionary[tsn][cellValue];
  };
};
