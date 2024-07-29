import { default as dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { intersection } from 'lodash';
import xlsx, { CellObject } from 'xlsx';
import { getLogger } from '../logger';
import { MediaFile } from '../media/media-file';
import { DEFAULT_XLSX_SHEET_NAME } from '../media/xlsx/xlsx-file';
import { safeToLowerCase } from '../string-utils';
import { replaceCellDates, trimCellWhitespace } from './cell-utils';
import { getColumnAliasesFromValidator, getColumnNamesFromValidator } from './column-validator-utils';

dayjs.extend(customParseFormat);

const defaultLog = getLogger('src/utils/xlsx-utils/worksheet-utils');

export interface IXLSXCSVColumn {
  /**
   * Supported column cell types
   *
   * time: HH:mm:ss
   */
  type: 'string' | 'number' | 'date' | 'time';
  /**
   * Allowed aliases / mappings for column headers.
   *
   */
  aliases?: Uppercase<string>[];
}

// Record with column name and column spec
export interface IXLSXCSVValidator {
  [columnName: Uppercase<string>]: IXLSXCSVColumn;
}

/**
 * Returns true if the given cell is a date type cell.
 *
 * @export
 * @param {MediaFile} file
 * @param {xlsx.ParsingOptions} [options]
 * @return {*}  {xlsx.WorkBook}
 */
export const constructXLSXWorkbook = (file: MediaFile, options?: xlsx.ParsingOptions): xlsx.WorkBook => {
  return xlsx.read(file.buffer, { cellDates: true, cellNF: true, cellHTML: false, ...options });
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
 * Get the lowercase headers (column names) for the given worksheet.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[]}
 */
export const getHeadersLowerCase = (worksheet: xlsx.WorkSheet): string[] => {
  return getHeadersUpperCase(worksheet).map(safeToLowerCase);
};

/**
 * Get the index of the given header name.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {string} headerName
 * @return {*}  {number}
 */
export const getHeaderIndex = (worksheet: xlsx.WorkSheet, headerName: string): number => {
  return getHeadersUpperCase(worksheet).indexOf(headerName);
};

/**
 * Return an array of row value arrays.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[][]}
 */
export const getWorksheetRows = (worksheet: xlsx.WorkSheet): string[][] => {
  const originalRange = getWorksheetRange(worksheet);

  if (!originalRange) {
    return [];
  }

  const rowsToReturn: string[][] = [];

  for (let i = 1; i <= originalRange.e.r; i++) {
    const row = new Array(getHeadersUpperCase(worksheet).length);
    let rowHasValues = false;

    for (let j = 0; j <= originalRange.e.c; j++) {
      const cellAddress = { c: j, r: i };
      const cellRef = xlsx.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];

      if (!cell) {
        continue;
      }

      row[j] = trimCellWhitespace(replaceCellDates(cell)).v;

      rowHasValues = true;
    }

    if (row.length && rowHasValues) {
      rowsToReturn.push(row);
    }
  }

  return rowsToReturn;
};

/**
 * Return an array of row value arrays.
 *
 * Note: The column headers will be transformed to UPPERCASE.
 *
 * @example
 * [
 *   {
 *     "HEADER1": "value1",
 *     "HEADER2": "value2",
 *     "HEADER3": "value3"
 *   },
 *   {
 *     "HEADER1": "value4",
 *     "HEADER2": "value5",
 *     "HEADER3": "value6"
 *   }
 * ]
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {Record<string, any>[]}
 */
export const getWorksheetRowObjects = (worksheet: xlsx.WorkSheet): Record<string, any>[] => {
  const ref = worksheet['!ref'];

  if (!ref) {
    return [];
  }

  const rowObjectsArray: Record<string, any>[] = [];
  const rows = getWorksheetRows(worksheet);
  const headers = getHeadersUpperCase(worksheet);

  for (let i = 0; i < rows.length; i++) {
    const rowObject: Record<string, any> = {};

    for (let j = 0; j < headers.length; j++) {
      rowObject[headers[j]] = rows[i][j];
    }

    rowObjectsArray.push(rowObject);
  }

  return rowObjectsArray;
};

/**
 * Return boolean indicating whether the worksheet has the expected headers.
 *
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
    const aliases: string[] = columnValidator[header]?.aliases ?? [];
    const columnHeaderAndAliases = [header, ...aliases];

    // Intersect the worksheet headers against the column header and aliases
    return intersection(columnHeaderAndAliases, worksheetHeaders).length;
  });
};

/**
 * Return boolean indicating whether the worksheet has correct column types. This only checks the required columns in the `columnValidator`
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {IXLSXCSVValidator[]} columnValidator
 * @return {*}  {boolean}
 */
export const validateWorksheetColumnTypes = (
  worksheet: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator
): boolean => {
  const worksheetRows = getWorksheetRows(worksheet);
  const columnNames = getColumnNamesFromValidator(columnValidator);

  return worksheetRows.every((row) => {
    return columnNames.every((columnName, index) => {
      const value = row[index];
      const type = typeof value;
      const columnSpec: IXLSXCSVColumn = columnValidator[columnName];

      let validated = false;

      if (columnSpec.type === 'date') {
        validated = dayjs(value).isValid();
      }

      /**
       * CSV column format will need to be updated to 'HH:mm:ss'.
       *
       * Possible enhancement: Drop the `true` param to validate times without leading `0`.
       * This will have downstream effects with zod schemas and database column type constraints expecting `09:10:10`.
       *
       * 09:10:10 -> true
       * 9:10:10 -> false
       *
       * @see https://day.js.org/docs/en/plugin/custom-parse-format
       */
      if (columnSpec.type === 'time') {
        validated = dayjs(value, 'HH:mm:ss', true).isValid();
      }

      if (columnSpec.type === type) {
        validated = true;
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
 * Get a worksheet by name.
 *
 * @export
 * @param {xlsx.WorkBook} workbook
 * @param {string} sheetName
 * @return {*}  {xlsx.WorkSheet}
 */
export const getWorksheetByName = (workbook: xlsx.WorkBook, sheetName: string): xlsx.WorkSheet => {
  return workbook.Sheets[sheetName];
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
 * Iterates over the cells in the worksheet and:
 * - Trims whitespace from cell values.
 * - Converts `Date` objects to ISO strings.
 *
 * https://stackoverflow.com/questions/61789174/how-can-i-remove-all-the-spaces-in-the-cells-of-excelsheet-using-nodejs-code
 * @param worksheet
 */
export const prepareWorksheetCells = (worksheet: xlsx.WorkSheet) => {
  const range = getWorksheetRange(worksheet);

  if (!range) {
    return undefined;
  }

  for (let r = range.s.r; r < range.e.r; r++) {
    for (let c = range.s.c; c < range.e.c; c++) {
      const coord = xlsx.utils.encode_cell({ r, c });
      let cell: CellObject = worksheet[coord];

      if (!cell?.v) {
        // Cell is null or has no raw value
        continue;
      }

      cell = replaceCellDates(cell);

      cell = trimCellWhitespace(cell);
    }
  }
};

/**
 * Validates the given CSV file against the given column validator
 *
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
