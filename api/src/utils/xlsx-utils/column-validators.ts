import { get } from 'lodash';
import { IXLSXCSVValidator } from './worksheet-utils';

type Row = Record<string, any>;

// Shared taxon / species aliases
const ITIS_TSN = 'ITIS_TSN';
const TAXON = 'TAXON';
const SPECIES = 'SPECIES';
const TSN = 'TSN';

// Critter columns and aliases
const ALIAS = 'ALIAS';
const NICKNAME = 'NICKNAME';

// Critter sex
const SEX = 'SEX';

// Critter Wildlife Health ID
const WLH_ID = 'WLH_ID';

// Shared comment aliases
const COMMENT = 'COMMENT';
const DESCRIPTION = 'DESCRIPTION';

// DateTime column names
const DATE = 'DATE';
const TIME = 'TIME';

// Latitude aliases
const LATITUDE = 'LATITUDE';
const LAT = 'LAT';

// Longitude aliases
const LONGITUDE = 'LONGITUDE';
const LON = 'LON';
const LONG = 'LONG';
const LNG = 'LNG';

// Observation sub-count aliases
const COUNT = 'COUNT';

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
 * Generate a row value getter function from array of allowed column values.
 *
 * NOTE: Should this be typesafe? Or should the validator logic handle the typing?
 *
 * @example const getTsnFromRow = generateCellValueGetter([ITIS_TSN, TSN, TAXON, SPECIES]);
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
