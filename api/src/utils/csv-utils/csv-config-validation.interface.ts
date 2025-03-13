export const CSV_ERROR_MESSAGE =
  'CSV contains validation errors. Please check for formatting issues, missing fields, or invalid values and try again.';

/**
 * The CSV configuration interface
 *
 * TODO:
 *  1. Allow or disallow duplicate CSV rows
 *    - Similar to a DB unique constraint? ie: ['NAME', 'AGE']
 *  2. Support CSVWarnings
 */
export interface CSVConfig<THeader extends Uppercase<string> = Uppercase<string>> {
  /**
   * Record containing the static headers, their aliases, and the `validateCell` and `setCellValue` callbacks
   * to be called for each static cell.
   *
   * Note: A static header is a header that is known and defined in the configuration.
   *
   * @type {Record<THeader, CSVStaticHeaderConfig & CSVHeaderConfig>}
   */
  staticHeadersConfig: Record<THeader, CSVStaticHeaderConfig & CSVHeaderConfig>;
  /**
   * Boolean to ignore dynamic headers.
   *
   * ie: If true, the dynamic headers will not be processed.
   *
   * @type {boolean}
   */
  ignoreDynamicHeaders: boolean;
  /**
   * Contains the `validateCell` and `setCellValue` callbacks to be called for each dynamic cell.
   *
   * Note: A dynamic header is a header that is not known and defined in the configuration.
   * The actual header name is `dynamic` meaning it is defined by the user.
   *
   * ie: Additional headers like measurements, markings, collection units etc.
   *
   * @type {CSVHeaderConfig | undefined}
   */
  dynamicHeadersConfig?: CSVHeaderConfig;

  /**
   * A list of row validators
   *
   * Note: These are called BEFORE the static and dynamic cell validators.
   * Useful if needing to validate multiple headers (ex: ALIAS, DATE, TIME) or applying some preliminary
   * validation before the cell validation.
   *
   * @type {CSVRowValidator[] | undefined}
   */
  rowValidators?: CSVRowValidator[];
}

interface CSVStaticHeaderConfig {
  /**
   * A list of aliases for the header.
   *
   * @type {Uppercase<string>[]}
   */
  aliases: Uppercase<string>[];
  /**
   * Indicates if the header is optional. Set this to true if you want to be able to omit the header from the CSV.
   *
   * Note: This is not related to the cell validation. It is used to check if the header is present in the CSV.
   *
   * @type {true}
   */
  optional?: true;
}

/**
 * The CSV header config cell validator function
 *
 * @param {CSVParams} params - The CSV parameters
 * @returns {CSVError[]} - The list of CSV errors
 */
export type CSVCellValidator = (params: CSVParams) => CSVError[];

/**
 * The CSV row validator function
 *
 * @param {CSVRowParams} params - The CSV row parameters
 * @returns {CSVRowError[]} - The list of CSV row errors
 *
 */
export type CSVRowValidator = (params: CSVRowParams) => CSVRowError[];

/**
 * The CSV header config cell setter function
 *
 * @param {CSVParams} params - The CSV parameters
 * @returns {*} {any} - The new cell value
 */
export type CSVCellSetter = (params: CSVParams) => any;

/**
 * The CSV header configuration interface
 *
 */
export interface CSVHeaderConfig {
  /**
   * Callback to fire when validating the cell. Returns a list of CSVErrors.
   *
   * @type {CSVCellValidator | undefined} The cell validator function
   */
  validateCell?: CSVCellValidator;
  /**
   * Callback to fire when setting the cell (after validation). Returns the new cell value.
   *
   * ie: Convert a string to a number, or find a the matching UUID for the cell value.
   *
   * @type {CSVCellSetter | undefined} The cell setter function
   */
  setCellValue?: CSVCellSetter;
}

export interface CSVRowParams {
  /**
   * The data row object.
   *
   * @type {CSVRow}
   */
  row: CSVRow;
  /**
   * The row index.
   *
   * Note: First data row index 0.
   *
   * @type {number}
   */
  rowIndex: number;
}

/**
 * The CSV parameters interface - passed to the cell validation/setter callbacks.
 *
 */
export interface CSVParams {
  /**
   * The cell value. Readonly to prevent mutation during validation.
   *
   * Why? CSVUtils and related functions are expecting the initial non-modified cell value for calculations.
   *
   * Use the `setCellValue` callback or the CSVParams `this.mutateCell` to update the cell value.
   *
   * @type {unknown}
   */
  readonly cell: unknown;
  /**
   * The mutatable cell value.
   *
   * @type {unknown}
   */
  mutateCell: unknown;
  /**
   * The row header name. The initial row key.
   *
   * @type {string}
   */
  header: string;
  /**
   * The data row object.
   *
   * @type {CSVRow}
   */
  row: CSVRow;
  /**
   * The row index.
   *
   * Note: First data row index 0.
   *
   * @type {number}
   */
  rowIndex: number;
  /**
   * The config static header name. The final row key.
   *
   * @type {string | undefined}
   */
  staticHeader?: string;
}

/**
 * The CSV error interface.
 *
 * @description
 * Set to `null` to explicitly indicate the value can `NOT` be overritten by consumers ie: missing header
 * Set property to `undefined` to indicate to consumers the value `CAN` be overritten
 * by a default down stream ie: cell value
 *
 * @example
 *  {
 *    error: `Invalid collection unit`, // No need to include the header name / cell
 *    solution: `Use a valid collection unit`, // Solution includes the instructions to resolve
 *    values: ['unit1', 'unit2'], // Optional list of allowed values
 *    header: 'POPULATION_UNIT',
 *    cell: 'unit3',
 *    row: 1, // Header row index 1. First data row index 2
 *  }
 */
export interface CSVError {
  /**
   * The error message. The user facing message to describe the error.
   *
   * @example `Invalid collection unit`
   * @type {string}
   */
  error: string;
  /**
   * The solution message. The user facing message to resolve the error.
   *
   * @example `Use a valid collection unit`
   * @type {string}
   */
  solution: string;
  /**
   * The list of allowed values if applicable.
   *
   * Note: Optional as not all errors will have a list of allowed values.
   *
   * @example ['unit1', 'unit2']
   * @type {(string[] | number[]) | undefined}
   */
  values?: string[] | number[] | null;
  /**
   * The cell value that caused the error.
   *
   * @example 'unit3'
   * @type {unknown | undefined}
   */
  cell?: unknown;
  /**
   * The header name. Typically this will be the user facing CSV header name.
   *
   * @example 'Population Unit'
   * @type {Uppercase<string> | string | null | undefined}
   */
  header?: Uppercase<string> | string | null;
  /**
   * The row index the error occurred.
   *
   * Note: Header row index 1. First data row index 2.
   *
   * @example 2
   * @type {number}
   */
  row?: number;
}

/**
 * Similar to `CSVError` but with additional required properties.
 *
 * Why? When returning errors from a row validator, additional properties
 * are required as it lacks the `CSVParams` object which is passed to the cell
 * validators. This is to ensure the error object is consistent across the validators.
 *
 */
export type CSVRowError = Prettify<Omit<CSVError, 'header'> & { header: Uppercase<string> | string | null }>;

/**
 * The CSV row state symbol to store additional row metadata
 * without interfering with the row shape or structure
 *
 */
export const CSVRowState = Symbol('CSVRowStateSymbol');

/**
 * The raw unvalidated CSV row
 *
 */
export type CSVRow = Record<Uppercase<string>, any> & {
  // The CSV row state symbol to store additional row metadata
  [CSVRowState]?: Record<string, any>;
};

/**
 * The validated CSV row keyed by the static headers
 *
 * Once validated, CSVRowState will be defined and possibly contain additional row metadata. ie: {} or {...metadata}
 *
 */
export type CSVRowValidated<StaticHeaderType extends Uppercase<string>> = Record<StaticHeaderType, any> & {
  // The CSV row state symbol to store additional row metadata
  [CSVRowState]: Record<string, any>;
};

export type CSVCell = string | number | undefined;

/**
 * The CSV row state options.
 *
 * Used with the `updateCSVRowState` function to modify its behaviour.
 */
export type CSVRowStateOptions = {
  /**
   * Set to true if you want to append the new value to the existing value (when keys are the same).
   * Set to false, or leave undefined, to overwrite the existing value with the new value (when keys are the same).
   *
   * @type {boolean}
   */
  append?: boolean;
};

/**
 * The CSV cell validator options
 */
export type CSVCellValidatorOptions = {
  /**
   * Set to true to make the cell value optional (ie: allow the cell to be empty)
   *
   * @default false
   * @type {boolean}
   */
  optional: boolean;
};

/**
 * The CSV array-cell validator options
 *
 */
export type CSVArrayCellValidatorOptions = {
  /**
   * The delimiter used to split the array-cell value.
   *
   * @example ';'
   * @type {string}
   */
  delimiter: string;
};
