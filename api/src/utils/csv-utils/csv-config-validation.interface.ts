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
   * Boolean to ignore dynamic headers.
   *
   * ie: If true, the dynamic headers will not be processed.
   *
   * @type {boolean}
   */
  ignoreDynamicHeaders: boolean;
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
 * The CSV error interface
 *
 * @example
 *  {
 *    error: `Invalid collection unit`, // No need to include the header name / cell
 *    solution: `Use a valid collection unit`, // Solution includes the instructions to resolve
 *    values: ['unit1', 'unit2'], // Optional list of allowed values
 *    header: 'POPULATION_UNIT',
 *    cell: 'unit3',
 *    row: 1, // Header row index 0. First data row index 1
 *  }
 */
export interface CSVError {
  /**
   * The error message.
   *
   * @type {string}
   */
  error: string;
  /**
   * The solution message.
   *
   * @type {string}
   */
  solution: string;
  /**
   * The list of allowed values if applicable.
   *
   * @type {(string[] | number[]) | undefined}
   */
  values?: string[] | number[] | null;
  /**
   * The cell value.
   *
   * @type {unknown | undefined}
   */
  cell?: unknown;
  /**
   * The header name.
   *
   * @type {string | null | undefined}
   */
  header?: string | null;
  /**
   * The row index the error occurred.
   *
   * Note: Header row index 1. First data row index 2.
   *
   * @type {number}
   */
  row?: number;
}

/**
 * The raw unvalidated CSV row
 *
 */
export type CSVRow = Record<Uppercase<string>, any>;

/**
 * The validated CSV row keyed by the static headers
 *
 */
export type CSVRowValidated<StaticHeaderType extends Uppercase<string>> = Record<StaticHeaderType, any>;

export type CSVCell = string | number | undefined;
