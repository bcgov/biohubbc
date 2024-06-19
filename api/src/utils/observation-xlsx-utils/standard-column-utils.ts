import xlsx from 'xlsx';
import { getHeadersUpperCase, IXLSXCSVValidator } from '../xlsx-utils/worksheet-utils';

// ITIS Taxon CSV standard column names and aliases
const ITIS_TSN = 'ITIS_TSN';
const TAXON = 'TAXON';
const SPECIES = 'SPECIES';
const TSN = 'TSN';

// Critter CSV standard column names and aliases
const ALIAS = 'ALIAS';
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
  columnNames: [ITIS_TSN, ALIAS, WLH_ID, DESCRIPTION],
  columnTypes: ['number', 'string', 'string', 'string'],
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
 * Get the TSN cell value for a given row.
 *
 * Note: Requires the row headers to be UPPERCASE.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getTsnFromRow(row: Record<string, any>) {
  return row[ITIS_TSN] ?? row[TSN] ?? row[TAXON] ?? row[SPECIES];
}

/**
 * Get the count cell value for a given row.
 *
 * Note: Requires the row headers to be UPPERCASE.
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
 * Note: Requires the row headers to be UPPERCASE.
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
 * Note: Requires the row headers to be UPPERCASE.
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
 * Note: Requires the row headers to be UPPERCASE.
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
 * Note: Requires the row headers to be UPPERCASE.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getLongitudeFromRow(row: Record<string, any>) {
  return row[LONGITUDE] ?? row[LON] ?? row[LONG] ?? row[LNG];
}

/**
 * Get the comment cell value for a given row.
 *
 * Note: Requires the row headers to be UPPERCASE.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getDescriptionFromRow(row: Record<string, any>) {
  return row[DESCRIPTION] ?? row[COMMENT];
}

/**
 * Get the alias cell value for a given row.
 *
 * Note: Requires the row headers to be UPPERCASE.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getAliasFromRow(row: Record<string, any>) {
  return row[ALIAS];
}

/**
 * Get the alias cell value for a given row.
 *
 * Note: Requires the row headers to be UPPERCASE.
 *
 * @export
 * @param {Record<string, any>} row
 * @return {*}
 */
export function getWlhIdFromRow(row: Record<string, any>) {
  return row[WLH_ID];
}
