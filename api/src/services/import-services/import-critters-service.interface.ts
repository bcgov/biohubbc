/**
 * Type wrapper for unknown CSV rows/records
 *
 */
export type Row = Record<string, any>;

/**
 * A validated CSV Critter object
 *
 */
export type CsvCritter = {
  critter_id: string;
  sex: 'Male' | 'Female' | 'Unknown';
  itis_tsn: number;
  animal_id: string;
  wlh_id?: string;
  critter_comment?: string;
} & {
  [collectionUnitColumn: string]: string;
};

/**
 * Invalidated CSV Critter object
 *
 */
export type PartialCsvCritter = Partial<CsvCritter> & { critter_id: string };

export type ValidationError = { row: number; message: string };

/**
 * Conditional validation type similar to Zod SafeParseReturn
 *
 */
export type Validation =
  | {
      success: true;
      data: CsvCritter[];
    }
  | {
      success: false;
      errors: ValidationError[];
    };
