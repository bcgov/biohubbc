import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { getLogger } from '../logger';
import {
  getAliasFromRow,
  getDescriptionFromRow,
  getSexFromRow,
  getTsnFromRow,
  getWlhIdFromRow
} from '../xlsx-utils/column-validators';

const defaultLog = getLogger('utils/critter-xlsx-utils/critter-column-utils');

/**
 * Type wrapper for unknown CSV rows or records
 *
 */
type Row = Record<string, any>;

/**
 * Inferred type from return of getRowSchema
 *
 */
export type CsvCritter = z.infer<ReturnType<typeof getRowValidationSchema>>;

/**
 * Get critter row validation schema with dynamic critter alias.
 *
 * @param {Set<string>} critterAliasSet - Set of allowed survey critter aliases
 * @returns {z.ZodObject} CsvCritter
 */
const getRowValidationSchema = (critterAliasSet: Set<string>) => {
  return z.object({
    critter_id: z.string(),
    sex: z.enum(['Unknown', 'Male', 'Female']),
    itis_tsn: z.number(), // Validation for itis_tsn exists in Critterbase
    wlh_id: z
      .string()
      .regex(/^\d{2}-.+/, '')
      .optional(), // valid: '10-0009R' invalid: '102-' or '10-' or '1-133K2'
    animal_id: z
      .string()
      .refine((value) => !critterAliasSet.has(value), 'Critter alias / nickname must be unique for Survey.'),
    critter_comment: z.string().optional()
  });
};

/**
 * Parse the CSV rows into the Critterbase critter format.
 *
 * @param {Row[]} rows - CSV rows
 * @returns {CsvCritter[]} Critterbase critters
 */

// TODO: Support ecological units (population units)

export const getCritterRowsToValidate = (rows: Row[]): CsvCritter[] => {
  return rows.map((row) => ({
    critter_id: uuid(), // Generate a uuid for each critter for convienence
    sex: getSexFromRow(row),
    itis_tsn: getTsnFromRow(row),
    wlh_id: getWlhIdFromRow(row),
    animal_id: getAliasFromRow(row),
    critter_comment: getDescriptionFromRow(row)
  }));
};

/**
 * Validate critter CSV rows.
 *
 * Note: Business rules require unique critter aliases for surveys. Meaning a critter can have a duplicated
 * alias as long as it is not in the same survey ie: different project
 *
 * @param {CsvCritter[]} rows - Critter rows
 * @param {Set<string>} surveyCritterAliases - Unique survey critter aliases
 * @returns {boolean} Validated
 */
export const validateCritterRows = (rows: CsvCritter[], surveyCritterAliases: Set<string>) => {
  const schema = getRowValidationSchema(surveyCritterAliases);

  const result = z.array(schema).safeParse(rows);

  if (!result.success) {
    defaultLog.debug({ label: 'validateCritterRows', message: 'invalid row', error: result.error });
  }

  return result.success;
};
