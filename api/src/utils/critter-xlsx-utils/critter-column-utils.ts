import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { ICollectionUnitWithCategory } from '../../services/critterbase-service';
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

export type CritterRowValidationConfig = {
  /**
   * Existing survey critter aliases
   *
   */
  aliases: Set<string>;
  /**
   * Valid TSNS
   *
   */
  tsns: Set<number>;
  /**
   * A Map of collection categories with associated collection units (Set)
   *
   */
  collectionUnits: Map<string, ICollectionUnitWithCategory[]>;
};

/**
 * Get critter row validation schema.
 *
 * Additional validation notes:
 *  1. Survey critters may use an existing animal alias, only one alias per survey.
 *  2. TSN's must be valid ie: ITIS has a reference for.
 *  3. Dynamic collection unit columns must contain correct reference values.
 *
 * @returns {z.ZodObject} CsvCritter
 */
export const getRowValidationSchema = (config: CritterRowValidationConfig) => {
  // Standard column validation with injected Sets of allowed values
  const validationSchema = {
    critter_id: z.string().uuid(),
    sex: z.enum(['Unknown', 'Male', 'Female']),
    itis_tsn: z.number().refine((tsn) => config.tsns.has(tsn), `Invalid 'ITIS_TSN'.`),
    wlh_id: z // valid: '10-0009R' invalid: '102-' or '10-' or '1-133K2'
      .string()
      .regex(/^\d{2}-.+/, `Invalid 'WLH_ID'. Example '10-1000R'`)
      .optional(),
    animal_id: z
      .string()
      .refine(
        (alias) => process.env.NODE_ENV === 'development' || !config.aliases.has(alias),
        `Invalid 'ALIAS'. Must be unique for survey.`
      ),
    critter_comment: z.string().optional()
  };

  // Dynamically adds validation to the collection unit columns
  config.collectionUnits.forEach((collectionUnits, collectionUnitHeader) => {
    // Set at top level to prevent having to search / find value multiple times
    let collectionUnitMatch: ICollectionUnitWithCategory | undefined;

    // Set the validation property name to be the cell header
    validationSchema[collectionUnitHeader] = z
      .string()
      // Search collection units for a match on the cell value
      .refine((cellValue) => {
        collectionUnitMatch = collectionUnits.find((unit) => unit.unit_name === cellValue);
        return Boolean(collectionUnitMatch);
      }, `Invalid value for '${collectionUnitHeader}'.`)
      // Transform the return of the validation to be the id of the collection unit
      .transform(() => collectionUnitMatch?.collection_unit_id)
      .optional();
  });

  return z.object(validationSchema);
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
    collectionUnitColumns.forEach((categoryHeader) => {
      standardCritterRow[categoryHeader] = row[categoryHeader];
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
 * @param {RowValidationConfig} config - Row validation config
 * @returns {boolean} Validated
 */
export const validateCritterRows = (
  rows: Partial<CsvCritter>[],
  config: CritterRowValidationConfig
): z.SafeParseReturnType<Partial<CsvCritter>[], CsvCritter[]> => {
  const critterRowValidationSchema = getRowValidationSchema(config);

  return z.array(critterRowValidationSchema).safeParse(rows);
};
