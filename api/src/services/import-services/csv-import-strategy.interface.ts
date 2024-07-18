import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { IXLSXCSVValidator } from '../../utils/xlsx-utils/worksheet-utils';

/**
 * Type wrapper for unknown CSV rows/records
 *
 */
export type Row = Record<string, any>;

/**
 * Implementation for CSV Import Services.
 *
 * @description All CSV import services should implement this interface to be used with `CSVImportStrategy`
 */
export interface CSVImportService<ValidatedRow, PartialRow> {
  /**
   * Standard column validator - used to validate the column headers and types.
   *
   * @see '../../utils/xlsx-utils/worksheet-utils.ts'
   * @see '../../utils/xlsx-utils/column-cell-utils.ts'
   */
  columnValidator: IXLSXCSVValidator;

  /**
   * Pre-parse rows for validateRows - return a list of structured row objects.
   *
   * @param {Row[]} rows - CSV rows to validate
   * @param {WorkSheet} [worksheet] - Xlsx worksheet - useful for calculating non-standard columns
   * @returns {PartialRow[]} Partial row objects
   */
  getRowsToValidate(rows: Row[], worksheet?: WorkSheet): PartialRow[];

  /**
   * Validate the pre-parsed rows - return either custom Validation or Zod SafeParse.
   *
   * @param {PartialRows[]} rows - Parsed CSV rows
   * @param {WorkSheet} [worksheet] - Xlsx worksheet - useful for calculating non-standard columns
   * @returns {*} Validation
   */
  validateRows(
    rows: PartialRow[],
    worksheet?: WorkSheet
  ): Promise<z.SafeParseReturnType<PartialRow[], ValidatedRow[]> | Validation<ValidatedRow>>;

  /**
   * Insert the validated rows into database or send to external systems.
   *
   * @param {ValidatedRows[]} rows - Validated CSV rows
   * @returns {Promise<unknown>}
   */
  insert(rows: ValidatedRow[]): Promise<unknown>;
}

/**
 * CSV validation error
 *
 */
export type ValidationError = {
  /**
   * CSV row index
   *
   */
  row: number;
  /**
   * CSV row error message
   *
   */
  message: string;
};

/**
 * Conditional validation type similar to Zod SafeParseReturn
 *
 */
export type Validation<T> =
  /**
   * On success (true) return the parsed CSV data
   */
  | {
      success: true;
      data: T[];
    }
  /**
   * On failure (false) return the parsed CSV validation errors
   */
  | {
      success: false;
      error: {
        issues: ValidationError[];
      };
    };
