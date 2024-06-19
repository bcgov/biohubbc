import { v4 as uuid } from 'uuid';
import { getLogger } from '../logger';
import {
  getAliasFromRow,
  getDescriptionFromRow,
  getTsnFromRow,
  getWlhIdFromRow
} from '../observation-xlsx-utils/standard-column-utils';

const defaultLog = getLogger('utils/critter-xlsx-utils/critter-column-utils');

type Row = Record<string, any>;

type CsvCritter = {
  critter_id: string;
  itis_tsn?: number;
  wlh_id?: string;
  animal_id?: string;
  critter_comment?: string;
};

/**
 * Checks if input string is a `Wildlife Health ID`.
 *
 * Rules:
 *  1. Starts with two digits
 *  2. Followed by a hyphen
 *  3. Followed by at least one character
 *
 * Valid: 10-0009R
 * Invalid: 102- || 10- || 1-133K2 || 102-3234A
 *
 * @param {string} wildlifeHealthId - Wildlife Health Identifier String
 * @returns {boolean} Is Wildlife Health ID
 */
export const isWildlifeHealthId = (wildlifeHealthId: string): boolean => /^\d{2}-.+/.test(wildlifeHealthId);

/**
 * Parse the CSV rows into the Critterbase critter format.
 *
 * @param {Row[]} rows - CSV rows
 * @returns {CsvCritter[]} Critterbase critters
 */
//TODO: Support ecological units (population units)

export const getCritterRowsToValidate = (rows: Row[]): CsvCritter[] => {
  return rows.map((row) => ({
    critter_id: uuid(), // Generate a uuid for each critter for convienence
    itis_tsn: getTsnFromRow(row),
    wlh_id: getWlhIdFromRow(row),
    animal_id: getAliasFromRow(row),
    critter_comment: getDescriptionFromRow(row)
  }));
};

/**
 * Validate critter rows are correct format.
 *
 * @param {CsvCritter[]} rows - Critter rows
 * @returns {boolean} Validated
 */
//TODO: Validate the critter alias against survey critter (1 alias per survey)
export const validateCritterRows = (rows: CsvCritter[]) => {
  const validated = rows.every((row) => {
    if (!row.itis_tsn || typeof row.itis_tsn !== 'number') {
      defaultLog.debug({ label: 'validateCritterRows', message: 'invalid tsn', itis_tsn: row.itis_tsn });

      // ITIS tsn / species / taxon is required
      return false;
    }

    if (row.wlh_id && isWildlifeHealthId(row.wlh_id)) {
      defaultLog.debug({ label: 'validateCritterRows', message: 'invalid wlh id', wlh_id: row.wlh_id });

      // Wildlife Health ID is invalid format
      return false;
    }

    if (row.animal_id && typeof row.animal_id !== 'string') {
      defaultLog.debug({ label: 'validateCritterRows', message: 'invalid alias', alias: row.animal_id });

      // Alias / nickname is invalid format
      return false;
    }

    if (row.critter_comment && typeof row.critter_comment !== 'string') {
      defaultLog.debug({ label: 'validateCritterRows', message: 'invalid comment', comment: row.critter_comment });

      // Description / comment is invalid format
      return false;
    }

    return true;
  });

  return validated;
};

//export const validateAliasAgainstSurveyCritters = (surveyCritters: any) => {};
