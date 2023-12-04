import moment from 'moment';
import xlsx, { CellObject } from 'xlsx';
import { MediaFile } from '../media/media-file';
import { safeToLowerCase, safeTrim } from '../string-utils';
import { replaceCellDates, trimCellWhitespace } from './cell-utils';

/**
 * Returns true if the given cell is a date type cell.
 *
 * @export
 * @param {MediaFile} file
 * @param {xlsx.ParsingOptions} [options]
 * @return {*}  {xlsx.WorkBook}
 */
export function constructXLSXWorkbook(file: MediaFile, options?: xlsx.ParsingOptions): xlsx.WorkBook {
  return xlsx.read(file.buffer, { cellDates: true, cellNF: true, cellHTML: false, ...options });
}

/**
 * Constructs a CSVWorksheets from the given workbook
 *
 * @export
 * @param {xlsx.WorkBook} workbook
 * @return {*}  {CSVWorksheets}
 */
export function constructWorksheets(workbook: xlsx.WorkBook): xlsx.WorkSheet {
  const worksheets: xlsx.WorkSheet = {};

  Object.entries(workbook.Sheets).forEach(([key, value]) => {
    worksheets[key] = value;
  });

  return worksheets;
}

/**
 * Get the headers for the given worksheet.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[]}
 */
export function getWorksheetHeaders(worksheet: xlsx.WorkSheet): string[] {
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

  let headers = [];

  if (aoaHeaders.length > 0) {
    // Parse the headers array from the array of arrays produced by calling `xlsx.utils.sheet_to_json`
    headers = aoaHeaders[0].map(safeTrim);
  }

  return headers;
}

/**
 * Get the headers for the given worksheet, with all values converted to lowercase.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[]}
 */
export function getHeadersLowerCase(worksheet: xlsx.WorkSheet): string[] {
  return getWorksheetHeaders(worksheet).map(safeToLowerCase);
}

/**
 * Get the index of the given header name.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {string} headerName
 * @return {*}  {number}
 */
export function getHeaderIndex(worksheet: xlsx.WorkSheet, headerName: string): number {
  return getWorksheetHeaders(worksheet).indexOf(headerName);
}

/**
 * Return an array of row value arrays.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[][]}
 */
export function getWorksheetRows(worksheet: xlsx.WorkSheet): string[][] {
  const originalRange = getWorksheetRange(worksheet);

  if (!originalRange) {
    return [];
  }

  const rowsToReturn: string[][] = [];

  for (let i = 1; i <= originalRange.e.r; i++) {
    const row = new Array(getWorksheetHeaders(worksheet).length);
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
}

/**
 * Return an array of row value arrays.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {Record<string, any>[]}
 */
export function getWorksheetRowObjects(worksheet: xlsx.WorkSheet): Record<string, any>[] {
  const ref = worksheet['!ref'];

  if (!ref) {
    return [];
  }

  const rowObjectsArray: Record<string, any>[] = [];
  const rows = getWorksheetRows(worksheet);
  const headers = getWorksheetHeaders(worksheet);

  rows.forEach((row: string[]) => {
    const rowObject = {};

    headers.forEach((header: string, index: number) => {
      rowObject[header] = row[index];
    });

    rowObjectsArray.push(rowObject);
  });

  return rowObjectsArray;
}

/**
 * Return boolean indicating whether the worksheet has the expected headers.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {string[]} expectedHeaders
 * @return {*}  {boolean}
 */
export function validateWorksheetHeaders(worksheet: xlsx.WorkSheet, expectedHeaders: string[]): boolean {
  const worksheetHeaders = getWorksheetHeaders(worksheet);

  if (worksheetHeaders.length !== expectedHeaders.length) {
    return false;
  }

  return expectedHeaders.every((header) => worksheetHeaders.includes(header));
}

/**
 * Return boolean indicating whether the worksheet has correct column types.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {string[]} rowValueTypes
 * @return {*}  {boolean}
 */
export function validateWorksheetColumnTypes(worksheet: xlsx.WorkSheet, rowValueTypes: string[]): boolean {
  const worksheetRows = getWorksheetRows(worksheet);

  return worksheetRows.every((row) => {
    if (row.length !== rowValueTypes.length) {
      return false;
    }

    return Object.values(row).every((value, index) => {
      const type = typeof value;

      if (rowValueTypes[index] === 'date') {
        return moment(value).isValid();
      }

      return rowValueTypes[index] === type;
    });
  });
}

/**
 * Get a worksheet by name.
 *
 * @export
 * @param {xlsx.WorkBook} workbook
 * @param {string} sheetName
 * @return {*}  {xlsx.WorkSheet}
 */
export function getWorksheetByName(workbook: xlsx.WorkBook, sheetName: string): xlsx.WorkSheet {
  return workbook.Sheets[sheetName];
}

/**
 * Get a worksheets decoded range object, or return undefined if the worksheet is missing range information.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {(xlsx.Range | undefined)}
 */
export function getWorksheetRange(worksheet: xlsx.WorkSheet): xlsx.Range | undefined {
  const ref = worksheet['!ref'];

  if (!ref) {
    return undefined;
  }

  return xlsx.utils.decode_range(ref);
}
/**
 * Iterates over the cells in the worksheet and:
 * - Trims whitespace from cell values.
 * - Converts `Date` objects to ISO strings.
 *
 * https://stackoverflow.com/questions/61789174/how-can-i-remove-all-the-spaces-in-the-cells-of-excelsheet-using-nodejs-code
 * @param worksheet
 */
export function prepareWorksheetCells(worksheet: xlsx.WorkSheet) {
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
}

export interface IXLSXCSVValidator {
  columnNames: string[];
  columnTypes: string[];
}
/**
 * Validates the given CSV file against the given column validator
 *
 * @param {MediaFile} file
 * @return {*}  {boolean}
 * @memberof ObservationService
 */
export function validateCsvFile(
  xlsxWorksheets: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator,
  sheet: string = 'Sheet1'
): boolean {
  // Validate the worksheet headers
  if (!validateWorksheetHeaders(xlsxWorksheets[sheet], columnValidator.columnNames)) {
    return false;
  }

  // Validate the worksheet column types
  if (!validateWorksheetColumnTypes(xlsxWorksheets[sheet], columnValidator.columnTypes)) {
    return false;
  }

  return true;
}
