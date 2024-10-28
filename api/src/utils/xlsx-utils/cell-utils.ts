import dayjs from 'dayjs';
import { CellObject } from 'xlsx';
import {
  AltDateFormat,
  AltDateFormatReverse,
  DefaultDateFormat,
  DefaultDateFormatReverse
} from '../../constants/dates';
import { safeTrim } from '../string-utils';

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
 * Attempts to identify and update cells whose values are either date strings or date objects to a consistent date
 * format.
 *
 * @see https://docs.sheetjs.com/docs/csf/cell for details on cell fields
 * @export
 * @param {CellObject} cell
 * @return {*}
 */
export function replaceCellDates(cell: CellObject) {
  if (!cell.v) {
    // Cell has no value
    return cell;
  }

  // If the cell was already interpreted as a date, format it to the default date format, and return
  if (isDateCell(cell) && cell.v instanceof Date) {
    // Attempt to parse the date using the format and update the cell value
    cell.v = dayjs((cell.v as Date).toISOString(), DefaultDateFormat).format(DefaultDateFormat);
    // Update the format to desired default format
    cell.z = DefaultDateFormat;
    // Ensure the cell type is set to date
    cell.t = 'd';

    return cell;
  }

  // If the cell is a string cell with a valid date value, update the cell value to a date type cell using the default
  // format, and return
  const matchingStringDateFormat = isStringCellWithDateValue(cell);
  if (matchingStringDateFormat) {
    // Attempt to parse the date using the format and update the cell value
    cell.v = dayjs(cell.v as string, matchingStringDateFormat).format(DefaultDateFormat);
    // Update the format to desired default format
    cell.z = DefaultDateFormat;
    // Ensure the cell type is set to date
    cell.t = 'd';

    return cell;
  }

  // The cell neither a date type cell nor a string type cell with a valid date string value
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
 * Checks if the cell value is a date string in a known date format.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {(false | string)} Return the matched date format if the cell value is a date string matching one known
 * date format, return `false` otherwise.
 */
export function isStringCellWithDateValue(cell: CellObject): false | string {
  if (!isStringCell(cell)) {
    return false;
  }

  const matchedFormats = [DefaultDateFormat, DefaultDateFormatReverse, AltDateFormat, AltDateFormatReverse].filter(
    (format) => dayjs(String(cell.v), format).isValid()
  );

  // Ensure only one format matched
  return matchedFormats.length === 1 ? matchedFormats[0] : false;
}

/**
 * Checks if the cell has a format, and if the format is likely a date format.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {boolean} `true` if the cell has a date format, `false` otherwise.
 */
export function doesCellHaveDateFormat(cell: CellObject): boolean {
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
export function doesCellHaveTimeFormat(cell: CellObject): boolean {
  if (!cell.z) {
    // Not a date cell and/or has no date format
    return false;
  }

  // format contains `h` and/or `ss` which are values only used in time formats, or date formats that include time
  return String(cell.z).includes('h') || String(cell.z).includes('ss');
}
