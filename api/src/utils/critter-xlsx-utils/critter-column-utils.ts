import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import {
  getAliasFromRow,
  getDescriptionFromRow,
  getSexFromRow,
  getTsnFromRow,
  getWlhIdFromRow
} from '../xlsx-utils/column-cell-utils';

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
 * Get critter row validation schema and inject existing survey critter aliases and matching TSNS.
 * Note: Survey critters may not share animal aliases. 1 alias per survey.
 *
 * @param {Set<string>} critterAliasSet - Set of allowed survey critter aliases
 * @param {Set<number>} matchingTsnSet - Set of matching TSNS from critter rows
 * @returns {z.ZodObject} CsvCritter
 */
const getRowValidationSchema = (critterAliasSet: Set<string>, matchingTsnSet: Set<number>) => {
  return z.intersection(
    z.object({
      critter_id: z.string(),
      sex: z.enum(['Unknown', 'Male', 'Female']),
      itis_tsn: z.number().refine((tsn) => matchingTsnSet.has(tsn), `Invalid ITIS TSN.`),
      wlh_id: z // valid: '10-0009R' invalid: '102-' or '10-' or '1-133K2'
        .string()
        .regex(/^\d{2}-.+/, `Invalid WLH_ID. Example '10-1000R'`)
        .optional(),
      animal_id: z
        .string()
        .refine(
          (alias) => process.env.NODE_ENV === 'development' || !critterAliasSet.has(alias),
          'Invalid ALIAS. Must be unique for survey.'
        ),
      critter_comment: z.string().optional()
    }),
    z.record(z.string(), z.string()) // Allow collection units to be passed through
  );
};

/**
 * Parse the CSV rows into the Critterbase critter format.
 *
 * @param {Row[]} rows - CSV rows
 * @returns {CsvCritter[]} Critterbase critters
 */
export const getCritterRowsToValidate = (rows: Row[], collectionUnitColumns: string[]): Partial<CsvCritter>[] => {
  return rows.map((row) => {
    // Standard critter properties from CSV
    const standardCritterRow = {
      critter_id: uuid(), // Generate a uuid for each critter for convienence
      sex: getSexFromRow(row),
      itis_tsn: getTsnFromRow(row),
      wlh_id: getWlhIdFromRow(row),
      animal_id: getAliasFromRow(row),
      critter_comment: getDescriptionFromRow(row)
    };

    // All other properties must be collection units ie: `population unit` or `herd unit` etc...
    collectionUnitColumns.forEach((collectionUnit) => {
      standardCritterRow[collectionUnit] = row[collectionUnit];
    });

    return standardCritterRow;
  });
};

/**
 * Validate critter CSV rows.
 *
 * Note: Business rules require unique critter aliases for surveys. Meaning a critter can have a duplicated
 * alias as long as it is not in the same survey ie: different project
 *
 * @param {CsvCritter[]} rows - Critter rows
 * @param {Set<string>} surveyCritterAliasSet - Unique survey critter aliases
 * @param {Set<number>} matchingTsnSet - Set of matching TSNS from critter rows
 * @returns {boolean} Validated
 */
export const validateCritterRows = (
  rows: Partial<CsvCritter>[],
  surveyCritterAliasSet: Set<string>,
  matchingTsnSet: Set<number>
): z.SafeParseReturnType<Partial<CsvCritter>[], CsvCritter[]> => {
  const critterRowValidationSchema = getRowValidationSchema(surveyCritterAliasSet, matchingTsnSet);

  return z.array(critterRowValidationSchema).safeParse(rows);
};
