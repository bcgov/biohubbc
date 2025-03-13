import { z } from 'zod';
import { CSVConfigUtils } from '../../../../utils/csv-utils/csv-config-utils';
import {
  CSVCellValidator,
  CSVError,
  CSVParams,
  CSVRowState
} from '../../../../utils/csv-utils/csv-config-validation.interface';
import { validateZodCell } from '../../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../../utils/nested-record';
import { CritterCSVStaticHeader } from '../import-critters-service';

/**
 * Get the critter alias cell validator.
 *
 * Rules:
 *  1. The cell can be a string with a length between 1 and 50
 *  2. The cell can be a number with a min value of 0
 *  3. The cell must be unique in the survey
 *  4. The cell must be unique in the CSV
 *
 * @param {Set<string>} surveyAliases The survey aliases.
 * @param {CSVConfigUtils<CritterCSVStaticHeader>} configUtils The CSV config utils.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCritterAliasCellValidator = (
  surveyAliases: Set<string>,
  configUtils: CSVConfigUtils<CritterCSVStaticHeader>
): CSVCellValidator => {
  return (params: CSVParams) => {
    const cellErrors = validateZodCell(params.cell, z.union([z.string().trim().min(1).max(50), z.number().min(0)]));
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
 * @param {NestedRecord<string>} rowDictionary The row dictionary.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCritterCollectionUnitCellValidator = (rowDictionary: NestedRecord<string>): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    // Get the ITIS TSN from the row state - set by the taxon row validator
    const rowTsn: number | null = params.row[CSVRowState]?.taxon.itis_tsn ?? null;

    // Let the taxon row validator handle invalid TSNs (runs before this validator)
    if (!rowTsn) {
      return [];
    }

    const collectionUnitCellValue = String(params.cell); // Cell value
    const collectionCategory = params.header; // Current header ie: collection category

    const rowDictionaryTsn = rowDictionary.get(rowTsn);

    // Check if the row TSN has associated collection units
    if (!rowDictionaryTsn) {
      return [
        {
          error: `Collection units not found for TSN: ${rowTsn}`,
          solution: `Validate TSN is correct and has collection units`
        }
      ];
    }

    const rowDictionaryCategory = rowDictionary.get(rowTsn, collectionCategory);

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

    const rowDictionaryUnit = rowDictionary.get(rowTsn, collectionCategory, collectionUnitCellValue);

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

    // Set the cell value to the collection unit id
    params.mutateCell = rowDictionaryUnit;

    return [];
  };
};

/**
 * Get the critter sex cell validator.
 *
 * Rules:
 *  1. The TSN must have sex measurements available
 *  2. The cell value must be a valid sex option for the TSN or undefined
 *
 * @param {NestedRecord<string>} rowDictionary The row dictionary.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getCritterSexCellValidator = (rowDictionary: NestedRecord<string>): CSVCellValidator => {
  return (params: CSVParams) => {
    if (params.cell === undefined) {
      return [];
    }

    // Get the ITIS TSN from the row state - set by the taxon row validator
    const rowTsn: number | null = params.row[CSVRowState]?.taxon.itis_tsn ?? null;

    // Let the taxon row validator handle invalid TSNs (runs before this validator)
    if (!rowTsn) {
      return [];
    }

    const sexCellValue = String(params.cell); // Cell value

    const rowDictionaryTsn = rowDictionary.get(rowTsn);

    // Check if the row TSN has sex measurements available
    if (!rowDictionaryTsn) {
      return [
        {
          error: `Sex is not a supported attribute for TSN: ${rowTsn}`,
          solution: `Use a valid TSN that supports sex, or contact a system administrator to add additional sex values.`
        }
      ];
    }

    const sexQualitativeOptionId = rowDictionary.get(rowTsn, sexCellValue);

    // Check if the cell value is a valid sex measurement for the TSN
    if (!sexQualitativeOptionId) {
      return [
        {
          error: `Sex cell value is invalid`,
          solution: `Use valid sex option`,
          values: Object.keys(rowDictionaryTsn)
        }
      ];
    }

    params.mutateCell = sexQualitativeOptionId;

    return [];
  };
};

/**
 * Get the Wildlife Health ID header cell validator.
 *
 * Rules:
 *  1. The Wildlife Health ID must be in the format 'XX-XXXX' or undefined
 *  2. The Wildlife Health ID must be unique in the CSV
 *
 * @param {CSVConfigUtils<CritterCSVStaticHeader>} configUtils The CSV config utils.
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getWlhIDCellValidator = (configUtils: CSVConfigUtils<CritterCSVStaticHeader>): CSVCellValidator => {
  return (params: CSVParams) => {
    const cellErrors: CSVError[] = [];

    if (params.cell === undefined) {
      return [];
    }

    const isWlhIdUnique = configUtils.isCellUnique('WLH_ID', params.cell);

    if (!/^\d{2}-.+/.exec(String(params.cell))) {
      cellErrors.push({
        error: `Invalid Wildlife Health ID format`,
        solution: `Update the Wildlife Health ID to match the expected format 'XX-XXXX'`
      });
    }

    if (!isWlhIdUnique) {
      cellErrors.push({
        error: `Wildlife Health ID already exists in the CSV`,
        solution: `Update the Wildlife Health ID to be unique`
      });
    }

    return cellErrors;
  };
};
