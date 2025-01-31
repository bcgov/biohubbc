import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { intersection, isUndefined } from 'lodash';
import xlsx from 'xlsx';
import { getLogger } from '../logger';
import { MediaFile } from '../media/media-file';
import { replaceCellDates, trimCellWhitespace } from './cell-utils';
import {
  generateColumnCellGetterFromColumnValidator,
  getColumnAliasesFromValidator,
  getColumnNamesFromValidator
} from './column-validator-utils';

dayjs.extend(customParseFormat);

const defaultLog = getLogger('src/utils/xlsx-utils/worksheet-utils');

export const DEFAULT_XLSX_SHEET_NAME = 'Sheet1';
export const CUSTOM_XLSX_DATE_FORMAT = 'YYYY-MM-DD';

export const WorksheetRowIndexSymbol = Symbol('WorksheetRowIndex');

export interface IXLSXCSVColumn {
  /**
   * Supported column cell types
   *
   * time: HH:mm:ss
   */
  type: 'string' | 'number' | 'date' | 'code' | 'stringOrNumber';
  /**
   * Allowed aliases / mappings for column headers.
   *
   */
  aliases?: Uppercase<string>[];
  /**
   * Column is optional.
   *
   */
  optional?: true;
}

// Record with column name and column spec
export interface IXLSXCSVValidator {
  [columnName: Uppercase<string>]: IXLSXCSVColumn;
}

/**
 * Construct the XLSX workbook.
 *
 * @export
 * @param {MediaFile} file
 * @return {*}  {xlsx.WorkBook}
 */
export const constructXLSXWorkbook = (file: MediaFile): xlsx.WorkBook => {
  return xlsx.read(
    file.buffer,
    // WARNING: Changing these options will affect the XLSX parsing and may cause unexpected results
    {
      // Custom date format
      dateNF: CUSTOM_XLSX_DATE_FORMAT,
      // Return date cells as epoch numbers (epoch start: `1900-01-01`)
      cellDates: false,
      // Include the number format (if any) of the value (.z field)
      cellNF: true,
      // Include the raw string version of the value (.w field)
      cellText: true,
      // Don't return raw, as this will return every cell as a string, even if it's a number or date
      raw: false
    }
  );
};

/**
 * Get the UPPERCASE headers (column names) for the given worksheet.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[]}
 */
export const getHeadersUpperCase = (worksheet: xlsx.WorkSheet): string[] => {
  const originalRange = getWorksheetRange(worksheet);

  if (!originalRange) {
    return [];
  }
  const customRange: xlsx.Range = { ...originalRange, e: { ...originalRange.e, r: 0 } };

  const aoaHeaders: any[][] = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    range: customRange
  });

  let headers: string[] = [];

  if (aoaHeaders.length > 0) {
    // Parse the headers array from the array of arrays produced by calling `xlsx.utils.sheet_to_json`
    headers = aoaHeaders[0]
      .map(String)
      .filter(Boolean)
      .map((header) => header.trim().toUpperCase());
  }

  return headers;
};

/**
 * Return an array of row value arrays.
 *
 * Note: The column headers will be transformed to UPPERCASE.
 * Note: Rows with no non-empty cells will be excluded.
 * Note: A `RowIndex` symbol will be added to each row object with the original row index.
 *
 * @example
 * [
 *   {
 *     "HEADER1": "value1",
 *     "HEADER2": "value2",
 *     "HEADER3": "value3"
 *     [RowIndex]: 1
 *   },
 *   // Empty row 2 was excluded
 *   {
 *     "HEADER1": "value4",
 *     "HEADER2": "value5",
 *     "HEADER3": "value6"
 *     [RowIndex]: 3
 *   }
 * ]
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {Record<symbol | string, any>[]}
 */
export const getWorksheetRowObjects = (worksheet: xlsx.WorkSheet): Record<symbol | string, any>[] => {
  const originalRange = getWorksheetRange(worksheet);

  if (!originalRange) {
    return [];
  }

  const headers = getHeadersUpperCase(worksheet);

  const rowObjectsArray: Record<symbol | string, any>[] = [];

  for (let i = 1; i <= originalRange.e.r; i++) {
    const rowObject: Record<symbol | string, any> = {};

    let rowHasValues = false;

    for (let j = 0; j <= originalRange.e.c; j++) {
      // Always add the header (key) to the row object
      rowObject[headers[j]] = undefined;

      const cellAddress = { c: j, r: i };
      const cellRef = xlsx.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];

      if (!cell) {
        continue;
      }

      // Set the cell value for the header, if the cell exists
      rowObject[headers[j]] = trimCellWhitespace(replaceCellDates(cell)).v;

      // If at least one cell has a value, then the row is not empty
      rowHasValues = true;
    }

    if (rowHasValues) {
      // Add the original row index to the row object
      // Symbols are non-enumerable, so they will be `hidden` in the rowObject
      rowObject[WorksheetRowIndexSymbol] = i;

      // Add the row object to the array if it has at least one non-empty cell
      rowObjectsArray.push(rowObject);
    }
  }

  return rowObjectsArray;
};

/**
 * Return boolean indicating whether the worksheet has the expected headers.
 *
 * @deprecated
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {IXLSXCSVValidator} columnValidator
 * @return {*}  {boolean}
 */
export const validateWorksheetHeaders = (worksheet: xlsx.WorkSheet, columnValidator: IXLSXCSVValidator): boolean => {
  // Get column names and aliases from validator
  const validatorHeaders = getColumnNamesFromValidator(columnValidator);

  // Get column names from actual worksheet
  const worksheetHeaders = getHeadersUpperCase(worksheet);

  // Check that every validator header has matching header or alias in worksheet
  return validatorHeaders.every((header) => {
    const columnSpec = columnValidator[header as keyof typeof columnValidator];

    const aliases = columnSpec?.aliases ?? [];
    const columnHeaderAndAliases = [header, ...aliases];

    // All column headers exist or only missing optional headers
    return intersection(columnHeaderAndAliases, worksheetHeaders).length || columnSpec.optional;
  });
};

/**
 * Return boolean indicating whether the worksheet has correct column types. This only checks the required columns in the `columnValidator`
 *
 * @deprecated
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {IXLSXCSVValidator[]} columnValidator
 * @return {*}  {boolean}
 */
export const validateWorksheetColumnTypes = (
  worksheet: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator
): boolean => {
  const worksheetRows = getWorksheetRowObjects(worksheet);
  const columnNames = getColumnNamesFromValidator(columnValidator);
  const getCellValue = generateColumnCellGetterFromColumnValidator(columnValidator);

  return worksheetRows.every((row) => {
    return columnNames.every((columnName, index) => {
      const value = getCellValue(row, columnName.toUpperCase() as Uppercase<string>).cell;
      const type = typeof value;
      const columnSpec: IXLSXCSVColumn = columnValidator[columnName];

      let validated = false;

      if (columnSpec.type === 'date') {
        validated = dayjs(value).isValid();
      }

      if (columnSpec.type === 'code') {
        // Codes are always strings?
        validated = type === 'string';
      }

      if (columnSpec.type === type) {
        validated = true;
      }

      if (columnSpec.type === 'stringOrNumber') {
        validated = type === 'string' || type === 'number';
      }

      // Undefined values only allowed if column spec is set to optional
      if (isUndefined(value)) {
        validated = Boolean(columnSpec.optional);
      }

      if (!validated) {
        defaultLog.debug({
          label: 'validateWorksheetColumnTypes',
          details: {
            columnName,
            columnType: columnSpec.type,
            cellValue: value,
            rowIndex: index
          }
        });
      }

      return validated;
    });
  });
};

/**
 * Attempt to get the default worksheet. If the default worksheet is not found, returns the first worksheet.
 *
 * @param {xlsx.WorkBook} workbook
 * @param {string} [defaultSheetNameOverride] Optional override for the default sheet name.
 * @return {*}  {xlsx.WorkSheet}
 */
export const getDefaultWorksheet = (workbook: xlsx.WorkBook, defaultSheetNameOverride?: string): xlsx.WorkSheet => {
  return (
    workbook.Sheets[defaultSheetNameOverride ?? DEFAULT_XLSX_SHEET_NAME] || workbook.Sheets[workbook.SheetNames[0]]
  );
};

/**
 * Get a worksheets decoded range object, or return undefined if the worksheet is missing range information.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {(xlsx.Range | undefined)}
 */
export const getWorksheetRange = (worksheet: xlsx.WorkSheet): xlsx.Range | undefined => {
  const ref = worksheet['!ref'];

  if (!ref) {
    return undefined;
  }

  return xlsx.utils.decode_range(ref);
};

/**
 * Validates the given CSV file against the given column validator
 *
 * @deprecated
 * @export
 * @param {xlsx.WorkSheet} xlsxWorksheet
 * @param {IXLSXCSVValidator} columnValidator
 * @return {*}  {boolean}
 */
export function validateCsvFile(xlsxWorksheet: xlsx.WorkSheet, columnValidator: IXLSXCSVValidator): boolean {
  // Validate the worksheet headers
  if (!validateWorksheetHeaders(xlsxWorksheet, columnValidator)) {
    defaultLog.debug({ label: 'validateCsvFile', message: 'Invalid: Headers' });
    return false;
  }

  // Validate the worksheet column types
  if (!validateWorksheetColumnTypes(xlsxWorksheet, columnValidator)) {
    defaultLog.debug({ label: 'validateCsvFile', message: 'Invalid: Column types' });
    return false;
  }

  return true;
}

/**
 * This function pulls out any non-standard columns from a CSV so they can be processed separately.
 *
 * @deprecated
 * @param {xlsx.WorkSheet} xlsxWorksheet The worksheet to pull the columns from
 * @param {IXLSXCSVValidator} columnValidator The column validator
 * @returns {*} string[] The list of non-standard columns found in the CSV
 */
export function getNonStandardColumnNamesFromWorksheet(
  xlsxWorksheet: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator
): string[] {
  const columns = getHeadersUpperCase(xlsxWorksheet);

  // Get column headers and aliases
  const columnValidatorHeaders = getColumnNamesFromValidator(columnValidator);
  const columnValidatorAliases = getColumnAliasesFromValidator(columnValidator);

  // Combine the column validator headers and all aliases
  const standardColumnNames = new Set([...columnValidatorHeaders, ...columnValidatorAliases]);

  // Only return column names not in the validation CSV Column validator (ie: only return the non-standard columns)
  return columns.filter((column) => !standardColumnNames.has(column));
}
