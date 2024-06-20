import { get } from 'lodash';
import xlsx from 'xlsx';
import { getHeadersUpperCase, IXLSXCSVValidator } from '../xlsx-utils/worksheet-utils';

type Row = Record<string, any>;

// ITIS Taxon CSV standard column names and aliases
const ITIS_TSN = 'ITIS_TSN';
const TAXON = 'TAXON';
const SPECIES = 'SPECIES';
const TSN = 'TSN';

// Critter CSV standard column names and aliases
const ALIAS = 'ALIAS';
const SEX = 'SEX';
const NICKNAME = 'NICKNAME';
const WLH_ID = 'WLH_ID';

// DateTime column names
const DATE = 'DATE';
const TIME = 'TIME';

// Spatial column names and aliases
const LATITUDE = 'LATITUDE';
const LAT = 'LAT';
const LONGITUDE = 'LONGITUDE';
const LON = 'LON';
const LONG = 'LONG';
const LNG = 'LNG';

// Additional column names and aliases
const COUNT = 'COUNT';
const COMMENT = 'COMMENT';
const DESCRIPTION = 'DESCRIPTION';

/**
 * An XLSX validation config for the standard columns of an observation CSV.
 */
export const observationStandardColumnValidator: IXLSXCSVValidator = {
  columnNames: [ITIS_TSN, COUNT, DATE, TIME, LATITUDE, LONGITUDE],
  columnTypes: ['number', 'number', 'date', 'string', 'number', 'number'],
  columnAliases: {
    ITIS_TSN: [TAXON, SPECIES, TSN],
    LATITUDE: [LAT],
    LONGITUDE: [LON, LONG, LNG]
  }
};

/**
 * An XLSX validation config for the standard columns of a critter CSV.
 */
export const critterStandardColumnValidator: IXLSXCSVValidator = {
  columnNames: [ITIS_TSN, SEX, ALIAS, WLH_ID, DESCRIPTION],
  columnTypes: ['number', 'string', 'string', 'string', 'string'],
  columnAliases: {
    ITIS_TSN: [TAXON, SPECIES, TSN],
    DESCRIPTION: [COMMENT],
    ALIAS: [NICKNAME]
  }
};

/**
 * This function pulls out any non-standard columns from a CSV so they can be processed separately.
 *
 * @param {xlsx.WorkSheet} xlsxWorksheets The worksheet to pull the columns from
 * @returns {*} string[] The list of non-standard columns found in the CSV
 */
export function getNonStandardColumnNamesFromWorksheet(xlsxWorksheet: xlsx.WorkSheet): string[] {
  const columns = getHeadersUpperCase(xlsxWorksheet);

  let aliasColumns: string[] = [];
  // Create a list of all column names and aliases
  if (observationStandardColumnValidator.columnAliases) {
    aliasColumns = Object.values(observationStandardColumnValidator.columnAliases).flat();
  }

  const standardColumNames = [...observationStandardColumnValidator.columnNames, ...aliasColumns];

  // Only return column names not in the validation CSV Column validator (ie: only return the non-standard columns)
  return columns.filter((column) => !standardColumNames.includes(column));
}

/**
 * Generate a row value getter function from array of allowed column values.
 *
 * NOTE: Should this be typesafe? Or should the validator logic handle the typing?
 *
 * @param {string[]} headers - Column headers
 * @returns {(row: Row) => any} Row value getter function
 */
const generateCellValueGetter = (headers: string[]) => {
  return (row: Row) => get(row, headers);
};

/**
 * Row cell value getters.
 *
 * Retrieve a specific row cell value from a list of provided headers.
 */
export const getTsnFromRow = generateCellValueGetter([ITIS_TSN, TSN, TAXON, SPECIES]);

export const getCountFromRow = generateCellValueGetter([COUNT]);

export const getDateFromRow = generateCellValueGetter([DATE]);

export const getTimeFromRow = generateCellValueGetter([TIME]);

export const getLatitudeFromRow = generateCellValueGetter([LATITUDE, LAT]);

export const getLongitudeFromRow = generateCellValueGetter([LONGITUDE, LONG, LON, LNG]);

export const getDescriptionFromRow = generateCellValueGetter([DESCRIPTION, COMMENT]);

export const getAliasFromRow = generateCellValueGetter([ALIAS, NICKNAME]);

export const getWlhIdFromRow = generateCellValueGetter([WLH_ID]);

export const getSexFromRow = generateCellValueGetter([SEX]);
