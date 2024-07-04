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

// Critter Wildlife Health ID and aliases
const WLH_ID = 'WLH_ID';
const WILDLIFE_HEALTH_ID = 'WILDLIFE_HEALTH_ID';

// Observation sub-count
const COUNT = 'COUNT';

// Capture headers
const CAPTURE_DATE = 'CAPTURE_DATE';
const CAPTURE_TIME = 'CAPTURE_TIME';
const CAPTURE_LATITUDE = 'CAPTURE_LATITUDE';
const CAPTURE_LONGITUDE = 'CAPTURE_LONGITUDE';
const RELEASE_DATE = 'CAPTURE_DATE';
const RELEASE_TIME = 'CAPTURE_TIME';
const RELEASE_LATITUDE = 'CAPTURE_LATITUDE';
const RELEASE_LONGITUDE = 'CAPTURE_LONGITUDE';

// Marking headers
const BODY_POSITION = 'BODY_POSITION';
const MARKING_TYPE = 'MARKING_TYPE';
const TYPE = 'TYPE';
const IDENTIFIER = 'IDENTIFIER';
const PRIMARY_COLOUR = 'PRIMARY_COLOUR';
const SECONDARY_COLOUR = 'SECONDARY_COLOUR';

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
 * An XLSX validation config for the standard columns of a capture CSV.
 */
export const captureStandardColumnValidator: IXLSXCSVValidator = {
  columnNames: [
    ALIAS,
    CAPTURE_DATE,
    CAPTURE_TIME,
    CAPTURE_LATITUDE,
    CAPTURE_LONGITUDE,
    RELEASE_DATE,
    RELEASE_TIME,
    RELEASE_LATITUDE,
    RELEASE_LONGITUDE,
    DESCRIPTION
  ],
  columnTypes: ['string', 'date', 'string', 'number', 'number', 'date', 'string', 'number', 'number', 'string'],
  columnAliases: {
    ALIAS: [NICKNAME],
    DESCRIPTION: [COMMENT]
  }
};

/**
 * An XLSX validation config for the standard columns of a marking CSV.
 */
export const markingStandardColumnValidator: IXLSXCSVValidator = {
  columnNames: [
    ALIAS,
    CAPTURE_DATE,
    CAPTURE_TIME,
    BODY_POSITION,
    MARKING_TYPE,
    IDENTIFIER,
    PRIMARY_COLOUR,
    SECONDARY_COLOUR,
    DESCRIPTION
  ],
  columnTypes: ['date', 'string', 'string', 'string', 'string', 'string', 'string', 'string'],
  columnAliases: {
    ALIAS: [NICKNAME],
    MARKING_TYPE: [TYPE],
    DESCRIPTION: [COMMENT]
  }
};

/**
 * Get column validator specification as a readable format. Useful for error handling and logging.
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
 * @returns {(row: Row) => T | undefined} Row value getter function
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

// Row cell value getters. Attempt to retrive a cell value from a list of known column headers.

/**
 * Generic getters
 *
 */
export const getTsnFromRow = generateCellValueGetter(ITIS_TSN, TSN, TAXON, SPECIES);

export const getCountFromRow = generateCellValueGetter(COUNT);

export const getDateFromRow = generateCellValueGetter(DATE);

export const getTimeFromRow = generateCellValueGetter(TIME);

export const getLatitudeFromRow = generateCellValueGetter(LATITUDE, LAT);

export const getLongitudeFromRow = generateCellValueGetter(LONGITUDE, LONG, LON, LNG);

export const getDescriptionFromRow = generateCellValueGetter<string>(DESCRIPTION, COMMENT);

/**
 * Critter getters
 *
 */
export const getAliasFromRow = generateCellValueGetter<string>(ALIAS, NICKNAME);

export const getWlhIdFromRow = generateCellValueGetter<string>(WLH_ID, WILDLIFE_HEALTH_ID);

export const getSexFromRow = generateCellValueGetter<string>(SEX);

/**
 * Capture getters
 *
 */
export const getCaptureDateFromRow = generateCellValueGetter<string>(CAPTURE_DATE);

export const getCaptureTimeFromRow = generateCellValueGetter<string>(CAPTURE_TIME);

export const getCaptureLatitudeFromRow = generateCellValueGetter<number>(CAPTURE_LATITUDE);

export const getCaptureLongitudeFromRow = generateCellValueGetter<number>(CAPTURE_LONGITUDE);

export const getReleaseDateFromRow = generateCellValueGetter<string>(RELEASE_DATE);

export const getReleaseTimeFromRow = generateCellValueGetter<string>(RELEASE_TIME);

export const getReleaseLatitudeFromRow = generateCellValueGetter<number>(RELEASE_LATITUDE);

export const getReleaseLongitudeFromRow = generateCellValueGetter<number>(RELEASE_LONGITUDE);

/**
 * Marking getters
 *
 */
export const getMarkingBodyPositionFromRow = generateCellValueGetter<string>(BODY_POSITION);

export const getMarkingTypeFromRow = generateCellValueGetter<string>(MARKING_TYPE);

export const getMarkingIdentifierFromRow = generateCellValueGetter<string>(IDENTIFIER);

export const getMarkingPrimaryColourFromRow = generateCellValueGetter<string>(PRIMARY_COLOUR);

export const getMarkingSecondaryColourFromRow = generateCellValueGetter<string>(SECONDARY_COLOUR);
