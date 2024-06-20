import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import {
  getAliasFromRow,
  getDescriptionFromRow,
  getSexFromRow,
  getTsnFromRow,
  getWlhIdFromRow
} from '../xlsx-utils/column-validators';

/**
 * Type wrapper for unknown CSV rows/records
 *
 */
type Row = Record<string, any>;

/**
 * Inferred zod schema type from return of getRowValidationSchema
 *
 */
export type CsvCritter = z.infer<ReturnType<typeof getRowValidationSchema>>;

/**
 * Get critter row validation schema and inject existing survey critter aliases.
 * Note: Survey critters may not share animal aliases. 1 alias per survey.
 *
 * @param {Set<string>} critterAliasSet - Set of allowed survey critter aliases
 * @returns {z.ZodObject} CsvCritter
 */
const getRowValidationSchema = (critterAliasSet: Set<string>) => {
  return z.object({
    critter_id: z.string(),
    sex: z.enum(['Unknown', 'Male', 'Female']),
    itis_tsn: z.number(),
    wlh_id: z
      .string()
      .regex(/^\d{2}-.+/, `Invalid WLH_ID. Example '10-1000R'`)
      .optional(), // valid: '10-0009R' invalid: '102-' or '10-' or '1-133K2'
    animal_id: z
      .string()
      .refine(
        (value) => process.env.NODE_ENV === 'development' || !critterAliasSet.has(value),
        'Critter alias / nickname must be unique for Survey.'
      ),
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

const getCritterRowsToValidate = (rows: Row[]): Partial<CsvCritter>[] => {
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
export const validateCritterRows = (
  rows: Row[],
  surveyCritterAliases: Set<string>
): z.SafeParseReturnType<Partial<CsvCritter>[], CsvCritter[]> => {
  const critterRows = getCritterRowsToValidate(rows);

  const critterRowValidationSchema = getRowValidationSchema(surveyCritterAliases);

  return z.array(critterRowValidationSchema).safeParse(critterRows);
};
