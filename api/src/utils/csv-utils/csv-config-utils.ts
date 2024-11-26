import { difference } from 'lodash';
import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { getHeadersUpperCase, getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';
import { CSVConfig, CSVError, CSVParams, CSVRow } from './csv-config-validation.interface';

/**
 * CSV Config Utils - A collection of methods useful when building CSVConfigs
 *
 * @exports
 * @class CSVConfigUtils
 */
export class CSVConfigUtils<T extends CSVConfig> {
  _config: T;
  worksheet: WorkSheet;
  worksheetRows: CSVRow[];

  constructor(worksheet: WorkSheet, config: T) {
    this._config = config;
    this.worksheet = worksheet;
    this.worksheetRows = getWorksheetRowObjects(worksheet);
  }

  /**
   * The CSV worksheet headers.
   *
   * @returns {Uppercase<string>[]} - The headers
   */
  get headers(): Uppercase<string>[] {
    return getHeadersUpperCase(this.worksheet) as Uppercase<string>[];
  }

  /**
   * The CSV worksheet static headers.
   *
   * @returns {Uppercase<string>[]} - The static headers
   */
  get staticHeaders(): Uppercase<string>[] {
    return this.headers.filter((header) => {
      return (
        header in this._config.staticHeadersConfig || this._config.staticHeadersConfig[header]?.aliases.includes(header)
      );
    });
  }

  /**
   * The CSV worksheet dynamic headers.
   *
   * @returns {Uppercase<string>[]} - The dynamic headers
   */
  get dynamicHeaders(): Uppercase<string>[] {
    return difference(this.headers, this.staticHeaders);
  }

  /**
   * Get the cell value from a CSV row.
   *
   * @param {keyof T['staticHeadersConfig']} header - The header name
   * @param {CSVRow} row - The CSV row
   * @returns {unknown} - The cell value
   */
  getCellValue(header: keyof T['staticHeadersConfig'], row: CSVRow) {
    if (header in row) {
      return row[header as Uppercase<string>];
    }

    for (const alias of this._config.staticHeadersConfig[header as Uppercase<string>].aliases) {
      if (alias in row) {
        return row[alias];
      }
    }
  }

  /**
   * Get all the cell values from a static header.
   *
   * @param {keyof T['staticHeadersConfig']} header - The header name
   * @returns {unknown[]} - The cell values
   */
  getCellValues(header: keyof T['staticHeadersConfig']) {
    return this.worksheetRows.map((row) => this.getCellValue(header, row));
  }

  /**
   * Get all the unique cell values from a static header.
   *
   * @param {keyof T['staticHeadersConfig']} header - The header name
   * @returns {unknown[]} - The unique cell values
   */
  getUniqueCellValues(header: keyof T['staticHeadersConfig']) {
    return [...new Set(this.getCellValues(header))];
  }

  /**
   * Validate a cell using a Zod schema.
   *
   * @param {CSVParams} params - The cell parameters
   * @param {z.ZodSchema} schema - The Zod schema
   * @returns {CSVError[]} - The cell validation errors
   */
  validateZodCell(params: CSVParams, schema: z.ZodSchema): CSVError[] {
    const errors: CSVError[] = [];

    const parsed = schema.safeParse(params.cell);

    if (!parsed.success) {
      parsed.error.errors.forEach((error) => {
        errors.push({
          error: error.message,
          solution: 'Update the cell value to match the expected type',
          ...this.getParamsError(params)
        });
      });
    }

    return errors;
  }

  getParamsError(params: CSVParams): Pick<CSVError, 'cell' | 'header' | 'rowIndex'> {
    return {
      cell: params.cell,
      header: params.header,
      rowIndex: params.rowIndex
    };
  }
}
