/**
 * The CSV configuration interface
 *
 */
export interface CSVConfig<THeader extends Uppercase<string> = Uppercase<string>> {
  /**
   * Record containing the static headers, their aliases, and the `validateCell` and `setCellValue` callbacks
   * to be called for each static cell.
   *
   * @type {Record<THeader, { aliases: Uppercase<string> } & CSVHeaderConfig>}
   */
  staticHeadersConfig: Record<THeader, { aliases: Uppercase<string> } & CSVHeaderConfig>;
  /**
   * Contains the `validateCell` and `setCellValue` callbacks to be called for each dynamic cell.
   *
   * @type {CSVHeaderConfig | undefined}
   */
  dynamicHeadersConfig?: CSVHeaderConfig;
  /**
   * Boolean to ignore dynamic headers.
   *
   * @type {boolean}
   */
  ignoreDynamicHeaders: boolean;
}

/**
 * The CSV header configuration interface
 *
 */
export interface CSVHeaderConfig {
  /**
   * Callback to fire when validating the cell.
   *
   * @type {(params: CSVParams) => CSVError[]}
   */
  validateCell?: (params: CSVParams) => CSVError[];
  /**
   * Callback to fire when setting the cell (after validation).
   *
   * @type {(params: CSVParams) => any | undefined}
   */
  setCellValue?: (params: CSVParams) => any;
}

/**
 * The CSV parameters interface - passed to the cell validation/setter callbacks.
 *
 */
export interface CSVParams {
  /**
   * The cell value.
   *
   * @type {unknown}
   */
  cell: unknown;
  /**
   * The row header name. The initial row key.
   *
   * @type {string}
   */
  header: string;
  /**
   * The cell row.
   *
   * @type {CSVRow}
   */
  row: CSVRow;
  /**
   * The cell row index.
   *
   * @type {number}
   */
  rowIndex: number;
  /**
   * The config static header name. The final row key for static headers.
   *
   * @type {string | undefined}
   */
  staticHeader?: string;
}

/**
 * The CSV error interface
 *
 */
export interface CSVError {
  /**
   * The error message.
   *
   * @type {string}
   */
  error: string;
  /**
   * The row index.
   *
   * @type {number}
   */
  rowIndex: number;
  /**
   * The solution message.
   *
   * @type {string | undefined}
   */
  solution?: string | undefined;
  /**
   * The allowed values.
   *
   * @type {(string[] | number[]) | undefined}
   */
  values?: string[] | number[];
  /**
   * The header name.
   *
   * @type {string | undefined}
   */
  header?: string | undefined;
  /**
   * The cell value.
   *
   * @type {unknown}
   */
  cell?: unknown;
}

export type CSVRowValidated<CSVConfigType extends CSVConfig> = Record<keyof CSVConfigType['staticHeadersConfig'], any>;

export type CSVRow = Record<string, any>;
