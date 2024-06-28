import { IXLSXCSVValidator } from './worksheet-utils';

type Row = Record<string, any>;

// Taxon / species aliases
const ITIS_TSN = 'ITIS_TSN';
const TAXON = 'TAXON';
const SPECIES = 'SPECIES';
const TSN = 'TSN';

// DateTime
const DATE = 'DATE';
const TIME = 'TIME';

// Latitude and aliases
const LATITUDE = 'LATITUDE';
const LAT = 'LAT';

// Longitude and aliases
const LONGITUDE = 'LONGITUDE';
const LON = 'LON';
const LONG = 'LONG';
const LNG = 'LNG';

// Comment aliases
const COMMENT = 'COMMENT';
const DESCRIPTION = 'DESCRIPTION';

// Critter nickname and aliases
const ALIAS = 'ALIAS';
const NICKNAME = 'NICKNAME';

// Critter sex
const SEX = 'SEX';

// Critter Wildlife Health ID
const WLH_ID = 'WLH_ID';

// Observation sub-count
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
 * Get column validator specification in a user readable format. Useful for error handling / logging.
 *
 * @param {IXLSXCSVValidator} columnValidator - Standard column validator
 * @returns {*}
 */
export const getColumnValidatorSpecification = (columnValidator: IXLSXCSVValidator) => {
  return columnValidator.columnNames.map((column, index) => ({
    columnName: column,
    columnType: columnValidator.columnTypes[index],
    columnAliases: columnValidator.columnAliases?.[column]
  }));
};

/**
 * Generate a row value getter function from array of allowed column values.
 *
 * @example const getTsnFromRow = generateCellValueGetter(ITIS_TSN, TSN, TAXON, SPECIES);
 *
 * @param {...string[]} headers - Column headers
 * @returns {(row: Row) => any} Row value getter function
 */
export const generateCellValueGetter = <T = any /* Temp default*/>(...headers: string[]) => {
  return (row: Row) => {
    for (const header of headers) {
      if (row[header]) {
        return row[header] as T;
      }
    }
  };
};

/**
 * Row cell value getters.
 *
 * Retrieve a specific row cell value from a list of provided headers.
 *
 * TODO: update generic types for getters (existing validators would need updating)
 */
export const getTsnFromRow = generateCellValueGetter(ITIS_TSN, TSN, TAXON, SPECIES);

export const getCountFromRow = generateCellValueGetter(COUNT);

export const getDateFromRow = generateCellValueGetter(DATE);

export const getTimeFromRow = generateCellValueGetter(TIME);

export const getLatitudeFromRow = generateCellValueGetter(LATITUDE, LAT);

export const getLongitudeFromRow = generateCellValueGetter(LONGITUDE, LONG, LON, LNG);

export const getDescriptionFromRow = generateCellValueGetter<string>(DESCRIPTION, COMMENT);

export const getAliasFromRow = generateCellValueGetter<string>(ALIAS, NICKNAME);

export const getWlhIdFromRow = generateCellValueGetter<string>(WLH_ID);

export const getSexFromRow = generateCellValueGetter<string>(SEX);
