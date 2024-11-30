import { countBy, difference } from 'lodash';
import { WorkSheet } from 'xlsx';
import { getHeadersUpperCase, getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';
import { CSVConfig, CSVRow } from './csv-config-validation.interface';

/**
 * CSV Config Utils - A collection of methods useful when building CSVConfigs
 *
 * @exports
 * @template StaticHeaderType - The static header type
 * @class CSVConfigUtils
 */
export class CSVConfigUtils<StaticHeaderType extends Uppercase<string>> {
  _config: CSVConfig<StaticHeaderType>;
  worksheet: WorkSheet;
  worksheetRows: CSVRow[];

  constructor(worksheet: WorkSheet, config: CSVConfig) {
    this._config = config;
    this.worksheet = worksheet;
    this.worksheetRows = getWorksheetRowObjects(worksheet);
  }

  /**
   * The CSV config static headers.
   *
   * @returns {Uppercase<string>[]} - The config headers
   */
  get configStaticHeaders(): Uppercase<string>[] {
    return Object.keys(this._config.staticHeadersConfig) as Uppercase<string>[];
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

      const aliases = this._config.staticHeadersConfig[header].aliases;

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

      const aliases = this._config.staticHeadersConfig[header].aliases;

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
   * Get the cell value from a CSV row.
   *
   * @param {StaticHeaderType} header - The header name
   * @param {CSVRow} row - The CSV row
   * @returns {unknown} - The cell value
   */
  getCellValue(header: StaticHeaderType, row: CSVRow) {
    // Static header or dynamic header exact match
    if (header in row) {
      return row[header];
    }

    // Attempt to find the cell value from the header aliases
    for (const alias of this._config.staticHeadersConfig[header]?.aliases ?? []) {
      if (alias in row) {
        return row[alias];
      }
    }
  }

  /**
   * Get all the cell values from a static header.
   *
   * @param {StaticHeaderType} header - The header name
   * @returns {unknown[]} - The cell values
   */
  getCellValues(header: StaticHeaderType) {
    return this.worksheetRows.map((row) => this.getCellValue(header, row));
  }

  /**
   * Get all the unique cell values from a static header.
   *
   * @param {StaticHeaderType} header - The header name
   * @returns {unknown[]} - The unique cell values
   */
  getUniqueCellValues(header: StaticHeaderType) {
    return [...new Set(this.getCellValues(header))];
  }

  /**
   * Check if all the cell values from a static header are unique.
   *
   * @param {StaticHeaderType} header - The header name
   * @param {unknown} cell - The cell value
   * @returns {boolean} - Whether all the cell values are unique
   */
  isCellUnique(header: StaticHeaderType, cell: unknown) {
    const uniqueDictionary = countBy(this.getCellValues(header), (value) => String(value).toLowerCase());
    const dictionaryKey = String(cell).toLowerCase();
    return uniqueDictionary[dictionaryKey] === 1 || uniqueDictionary[dictionaryKey] === undefined;
  }
}
