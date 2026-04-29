import lodash from 'lodash';
import { WorkSheet } from 'xlsx';
import { getHeadersUpperCase, getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';
import { CSVCell, CSVConfig, CSVHeaderConfig, CSVRow } from './csv-config-validation.interface';

const { countBy, difference } = lodash;

/**
 * CSV Config Utils - A collection of methods useful when building CSVConfigs
 *
 * @exports
 * @template StaticHeaderType - The static header type
 * @class CSVConfigUtils
 */
export class CSVConfigUtils<StaticHeaderType extends Uppercase<string> = Uppercase<string>> {
  config: CSVConfig<StaticHeaderType>;
  worksheet: WorkSheet;
  worksheetRows: CSVRow[];

  constructor(worksheet: WorkSheet, config: CSVConfig<StaticHeaderType>) {
    this.config = config;
    this.worksheet = worksheet;
    this.worksheetRows = getWorksheetRowObjects(worksheet);
  }

  /**
   * The CSV config static headers.
   *
   * @returns {StaticHeaderType[]} - The config headers
   */
  get configStaticHeaders(): StaticHeaderType[] {
    return Object.keys(this.config.staticHeadersConfig) as StaticHeaderType[];
  }

  /**
   * The CSV worksheet headers. Raw incomming headers from the worksheet.
   *
   * @example
   *  worksheetHeaders: ['STATIC1', 'STATIC2_ALIAS', 'DYNAMIC1']
   *  this:             ['STATIC1', 'STATIC2_ALIAS', 'DYNAMIC1']
   *
   * @returns {Uppercase<string>[]} - The headers
   */
  get worksheetHeaders(): Uppercase<string>[] {
    return getHeadersUpperCase(this.worksheet) as Uppercase<string>[];
  }

  /**
   * The CSV worksheet aliased static headers (leaves aliased headers as is).
   *
   * @example
   *  worksheetHeaders: ['STATIC1', 'STATIC2_ALIAS', 'DYNAMIC1']
   *  this:             ['STATIC1', 'STATIC2_ALIAS']
   *
   * @returns {Uppercase<string>[]} - The static headers
   */
  get worksheetAliasedStaticHeaders(): Uppercase<string>[] {
    const staticHeaders: Uppercase<string>[] = [];
    const worksheetHeaders = new Set(this.worksheetHeaders);

    for (const header of this.configStaticHeaders) {
      if (worksheetHeaders.has(header)) {
        staticHeaders.push(header);
      }

      const aliases = this.config.staticHeadersConfig[header].aliases;

      for (const alias of aliases) {
        if (worksheetHeaders.has(alias)) {
          // Pushing the alias instead of the static header
          staticHeaders.push(alias);
        }
      }
    }

    return staticHeaders;
  }

  /**
   * The CSV worksheet static headers (converts aliased headers to static headers).
   *
   * @example
   *  worksheetHeaders: ['STATIC1', 'STATIC2_ALIAS', 'DYNAMIC'] // STATIC2_ALIAS is an alias for STATIC2
   *  this:             ['STATIC1', 'STATIC2']
   *
   * @returns {Uppercase<string>[]} - The static headers
   */
  get worksheetStaticHeaders(): Uppercase<string>[] {
    const staticHeaders: Uppercase<string>[] = [];
    const worksheetHeaders = new Set(this.worksheetHeaders);

    for (const header of this.configStaticHeaders) {
      if (worksheetHeaders.has(header)) {
        staticHeaders.push(header);
      }

      const aliases = this.config.staticHeadersConfig[header].aliases;

      for (const alias of aliases) {
        if (worksheetHeaders.has(alias)) {
          // Pushing the static header instead of the alias
          staticHeaders.push(header);
        }
      }
    }

    return staticHeaders;
  }

  /**
   * The CSV worksheet dynamic headers.
   *
   * @example
   *  worksheetHeaders: ['STATIC1', 'STATIC2_ALIAS', 'DYNAMIC1']
   *  this:             ['DYNAMIC1']
   *
   * @returns {Uppercase<string>[]} - The dynamic headers
   */
  get worksheetDynamicHeaders(): Uppercase<string>[] {
    return difference(this.worksheetHeaders, this.worksheetAliasedStaticHeaders);
  }

  /**
   * Given a static header and a CSV row, return the header used in the worksheet.
   * This value will either be the static header or an alias of the static header.
   *
   * Why? Useful if needing to return the header name as it appears in the CSV worksheet.
   *
   * @param {StaticHeaderType} header - The header name
   * @param {CSVRow} row - The CSV row
   * @returns {Uppercase<string> | null} - The header name or null if not found
   */
  getWorksheetHeader(header: StaticHeaderType, row: CSVRow): Uppercase<string> | null {
    // Static header or dynamic header exact match
    if ((header as Uppercase<string>) in row) {
      return header;
    }

    // Attempt to find the matching header from the header aliases
    for (const alias of this.config.staticHeadersConfig[header]?.aliases ?? []) {
      if (alias in row) {
        return alias;
      }
    }

    return null;
  }

  /**
   * Set a static header config. Injects the header config into the CSV static headers config.
   *
   * @param {StaticHeaderType} header - The header name
   * @param {CSVHeaderConfig} headerConfig - The header config
   * @returns {void}
   */
  setStaticHeaderConfig(header: StaticHeaderType, headerConfig: CSVHeaderConfig): void {
    this.config.staticHeadersConfig[header] = { ...this.config.staticHeadersConfig[header], ...headerConfig };
  }

  /**
   * Set all static header configs. Injects the header configs into the CSV static headers config.
   * Similar to `setStaticHeaderConfig` but for all headers.
   *
   * @param {Record<StaticHeaderType, CSVHeaderConfig>} headersConfig - The header configs
   * @returns {void}
   */
  setAllStaticHeaderConfigs(headersConfig: Record<StaticHeaderType, CSVHeaderConfig>): void {
    for (const header in headersConfig) {
      this.setStaticHeaderConfig(header, headersConfig[header]);
    }
  }

  /**
   * Get the final CSV config
   *
   * @returns {CSVConfig<StaticHeaderType>} - The CSV config
   */
  getConfig(): CSVConfig<StaticHeaderType> {
    for (const header of this.configStaticHeaders) {
      if (!this.config.staticHeadersConfig[header].validateCell) {
        throw new Error(`Invalid CSV config. Missing 'validateCell' for static header: ${header}`);
      }
    }

    return this.config;
  }

  /**
   * Get the cell value from a CSV row.
   *
   * @param {StaticHeaderType} header - The header name
   * @param {CSVRow} row - The CSV row
   * @returns {CSVCell} - The cell value
   */
  getCellValue(header: StaticHeaderType, row: CSVRow): CSVCell {
    // Static header or dynamic header exact match
    if ((header as Uppercase<string>) in row) {
      return row[header];
    }

    // Attempt to find the cell value from the header aliases
    for (const alias of this.config.staticHeadersConfig[header]?.aliases ?? []) {
      if (alias in row) {
        return row[alias];
      }
    }
  }

  /**
   * Get the array-cell values from a CSV row.
   *
   * @param {StaticHeaderType} header - The header name
   * @param {CSVRow} row - The CSV row
   * @param {{ delimiter: string }} options - The options
   * @return {(string[] | undefined)} - The array-cell values or undefined if none found
   */
  getArrayCellValue(header: StaticHeaderType, row: CSVRow, options: { delimiter: string }): string[] | undefined {
    // Static header or dynamic header exact match
    const cellValue = this.getCellValue(header, row);

    if (!cellValue) {
      // No cell value found
      return undefined;
    }

    // Split the original cell value by the delimiter, trimming whitespace and removing empty values
    return String(cellValue)
      .split(options.delimiter)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  /**
   * Get all the cell values from a static header.
   *
   * @param {StaticHeaderType} header - The header name
   * @returns {CSVCell[]} - The cell values
   */
  getCellValues(header: StaticHeaderType): CSVCell[] {
    return this.worksheetRows.map((row) => this.getCellValue(header, row));
  }

  /**
   * Get all the array-cell values from a static header.
   *
   * @param {StaticHeaderType} header - The header name
   * @return {((string | undefined)[])} - The array-cell values
   */
  getArrayCellValues(header: StaticHeaderType, options: { delimiter: string }): (string | undefined)[] {
    return this.worksheetRows.flatMap((row) => this.getArrayCellValue(header, row, options));
  }

  /**
   * Get all the unique cell values from a static header - case sensitive.
   *
   * @param {StaticHeaderType} header - The header name
   * @returns {CSVCell[]} - The unique cell values
   */
  getUniqueCellValues(header: StaticHeaderType): CSVCell[] {
    return [...new Set(this.getCellValues(header))];
  }

  /**
   * Get all the unique array-cell values from a static header - case sensitive.
   *
   * @param {StaticHeaderType} header - The header name
   * @returns {((string | undefined)[])} - The unique array-cell values
   */
  getUniqueArrayCellValues(header: StaticHeaderType, options: { delimiter: string }): (string | undefined)[] {
    return [...new Set(this.getArrayCellValues(header, options))];
  }

  /**
   * Check if all the cell values from a static header are unique.
   *
   * @param {StaticHeaderType} header - The header name
   * @param {unknown} cell - The cell value
   * @returns {boolean} - Whether all the cell values are unique
   */
  isCellUnique(header: StaticHeaderType, cell: unknown): boolean {
    const uniqueDictionary = countBy(this.getCellValues(header), (value) => String(value).toLowerCase());
    const dictionaryKey = String(cell).toLowerCase();
    return uniqueDictionary[dictionaryKey] === 1 || uniqueDictionary[dictionaryKey] === undefined;
  }
}
