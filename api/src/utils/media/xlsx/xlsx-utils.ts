import dayjs from 'dayjs';
import xlsx, { CellObject } from 'xlsx';
import { safeTrim } from '../../string-utils';

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

      if (!cell || !cell.v) {
        // Cell is null or has no raw value
        continue;
      }

      cell = replaceCellDates(cell);

      cell = trimCellWhitespace(cell);
    }
  }
}

/**
 * Trims whitespace from the value of a string type cell.
 * Trims whitespace from the formatted text value of a cell, if present.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}
 */
export function trimCellWhitespace(cell: CellObject) {
  if (isStringCell(cell)) {
    // check and clean raw strings
    cell.v = safeTrim(cell.v);
  }

  if (cell.w) {
    // check and clean formatted strings
    cell.w = safeTrim(cell.w);
  }

  return cell;
}

/**
 * Attempts to update the cells value with a formatted date or time value if the cell is a date type cell that has a
 * date or time format.
 *
 * @see https://docs.sheetjs.com/docs/csf/cell for details on cell fields
 * @export
 * @param {CellObject} cell
 * @return {*}
 */
export function replaceCellDates(cell: CellObject) {
  if (!isDateCell(cell)) {
    return cell;
  }

  const cellDate = dayjs(cell.v as any);

  if (!cellDate.isValid()) {
    return cell;
  }

  if (isDateFormatCell(cell)) {
    const DateFormat = 'YYYY-MM-DD';
    cell.v = cellDate.format(DateFormat);
    return cell;
  }

  if (isTimeFormatCell(cell)) {
    const TimeFormat = 'HH:mm';
    cell.v = cellDate.format(TimeFormat);
    return cell;
  }

  return cell;
}

/**
 * Checks if the cell has type string.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {boolean} `true` if the cell has type string, `false` otherwise.
 */
export function isStringCell(cell: CellObject): boolean {
  return cell.t === 's';
}

/**
 * Checks if the cell has type date.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {boolean} `true` if the cell has type date, `false` otherwise.
 */
export function isDateCell(cell: CellObject): boolean {
  return cell.t === 'd';
}

/**
 * Checks if the cell has a format, and if the format is likely a date format.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {boolean} `true` if the cell has a date format, `false` otherwise.
 */
export function isDateFormatCell(cell: CellObject): boolean {
  if (!cell.z) {
    return false;
  }

  // format contains `d` and/or `y` which are values only used in date formats
  return String(cell.z).includes('d') || String(cell.z).includes('y');
}

/**
 * Checks if the cell has a format, and if the format is likely a time format.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {boolean} `true` if the cell has a time format, `false` otherwise.
 */
export function isTimeFormatCell(cell: CellObject): boolean {
  if (!cell.z) {
    // Not a date cell and/or has no date format
    return false;
  }

  // format contains `h` and/or `ss` which are values only used in time formats, or date formats that include time
  return String(cell.z).includes('h') || String(cell.z).includes('ss');
}
