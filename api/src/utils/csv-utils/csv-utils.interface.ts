import { WorkSheet } from 'xlsx';

/**
 * The CSV configuration interface
 *
 */
export interface CSVConfig {
  /**
   * The CSV headers configs.
   * @type {CSVHeader[]}
   */
  headers: CSVHeader[];
  /**
   * Boolean to ignore unknown headers.
   * @type {boolean | undefined}
   */
  ignoreUnknownHeaders?: boolean;
  /**
   * Callback to fire when validating an unknown cell.
   * @type {(params: CSVParams) => CSVError[] | undefined}
   */
  validateUnknownCell?: (params: CSVParams) => CSVError[];
  /**
   * Callback to fire when setting an unknown cell value (after validation). Uses unknown `header` as the key.
   * @type {(params: CSVParams) => any | undefined}
   */
  setUnknownCellValue?: (params: CSVParams) => any;
}

/**
 * The CSV header interface
 *
 */
export interface CSVHeader {
  /**
   * The property name to use when mutating the row.
   * @example 'age'
   * @type {string}
   */
  $property: string;
  /**
   * The header name and aliases.
   * @example ['AGE', 'YEARS']
   * @type {Uppercase<string>[]}
   */
  headerNames: Uppercase<string>[];
  /**
   * Callback to fire when validating the cell.
   * @type {(params: CSVParams) => CSVError[]}
   */
  validateCell: (params: CSVParams) => CSVError[];
  /**
   * Callback to fire when setting the cell (after validation). Uses `$property` as the key.
   * @type {(params: CSVParams) => any | undefined}
   */
  setCellValue?: (params: CSVParams) => any;
}

/**
 * The CSV error interface
 *
 */
export interface CSVError {
  /**
   * The error message.
   * @type {string}
   */
  error: string;
  /**
   * The row index.
   * @type {number}
   */
  rowIndex: number;
  /**
   * The solution message.
   * @type {string | undefined}
   */
  solution?: string | undefined;
  /**
   * The header name.
   * @type {string | undefined}
   */
  header?: string | undefined;
}

/**
 * The CSV parameters interface - passed to the cell validation/setter callbacks.
 *
 */
export interface CSVParams {
  /**
   * The cell value.
   * @type {unknown}
   */
  cell: unknown;
  /**
   * The cell row.
   * @type {CSVRow}
   */
  row: CSVRow;
  /**
   * The cell header name.
   * @type {string}
   */
  header: string;
  /**
   * The cell row index.
   * @type {number}
   */
  rowIndex: number;
  /**
   * The full worksheet.
   * @type {WorkSheet}
   */
  worksheet: WorkSheet;
}

export type CSVRow = Record<string, any>;
