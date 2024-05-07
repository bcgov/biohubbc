import xlsx from 'xlsx';
import { DEFAULT_XLSX_SHEET_NAME } from '../media/xlsx/xlsx-file';
import { getWorksheetHeaders, IXLSXCSVValidator } from '../xlsx-utils/worksheet-utils';

// Observation CSV standard column names and aliases
const ITIS_TSN = 'ITIS_TSN';
const TAXON = 'TAXON';
const SPECIES = 'SPECIES';
const TSN = 'TSN';

const COUNT = 'COUNT';

const DATE = 'DATE';

const TIME = 'TIME';

const LATITUDE = 'LATITUDE';
const LAT = 'LAT';

const LONGITUDE = 'LONGITUDE';
const LON = 'LON';
const LONG = 'LONG';
const LNG = 'LNG';

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
 * This function pulls out any non-standard columns from a CSV so they can be processed separately.
 *
 * @param {xlsx.WorkSheet} xlsxWorksheets The worksheet to pull the columns from
 * @param {string} sheet The sheet to work on
 * @returns {*} string[] The list of non-standard columns found in the CSV
 */
export function getNonStandardColumnNamesFromWorksheet(
  xlsxWorksheets: xlsx.WorkSheet,
  sheet = DEFAULT_XLSX_SHEET_NAME
): string[] {
  const columns = getWorksheetHeaders(xlsxWorksheets[sheet]);

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
 * Get the TSN cell value for a given row.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}  {(string)}
 */
export function getTsnFromRow(row: Record<string, any>) {
  return row[ITIS_TSN] ?? row[TSN] ?? row[TAXON] ?? row[SPECIES];
}

/**
 * Get the count cell value for a given row.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getCountFromRow(row: Record<string, any>) {
  return row[COUNT];
}

/**
 * Get the date cell value for a given row.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getDateFromRow(row: Record<string, any>) {
  return row[DATE];
}

/**
 * Get the time cell value for a given row.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getTimeFromRow(row: Record<string, any>) {
  return row[TIME];
}

/**
 * Get the latitude cell value for a given row.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getLatitudeFromRow(row: Record<string, any>) {
  return row[LATITUDE] ?? row[LAT];
}

/**
 * Get the longitude cell value for a given row.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getLongitudeFromRow(row: Record<string, any>) {
  return row[LONGITUDE] ?? row[LON] ?? row[LONG] ?? row[LNG];
}
