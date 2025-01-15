import dayjs from 'dayjs';
import xlsx, { CellObject } from 'xlsx';
import {
  AltDateFormat,
  AltDateFormatReverse,
  DefaultDateFormat,
  DefaultDateFormatReverse,
  USAltDateFormat,
  USAltDateFormatReverse,
  USDefaultDateFormat,
  USDefaultDateFormatReverse
} from '../../constants/dates';
import { safeTrim } from '../string-utils';
import { DEFAULT_XLSX_DATE_FORMAT } from './worksheet-utils';

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
 * Attempts to identify and update cells whose values are either dates or times to a consistent format.
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

  if (cell.z !== DEFAULT_XLSX_DATE_FORMAT) {
    // Cell is not a date or time cell
    return cell;
  }

  const matchInteger = /^\d+$/;
  const matchDecimal = /^0\.\d+$/;

  if (matchInteger.test(String(cell.v))) {
    // Cell is an integer that represents a date
    cell.z = 'yyyy-mm-dd';
    cell.v = xlsx.utils.format_cell(cell);
  } else if (matchDecimal.test(String(cell.v))) {
    // Cell is an integer that represents a time
    cell.z = 'hh:mm:ss';
    cell.v = xlsx.utils.format_cell(cell);
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
 * Checks if the cell value is a date string in a known date format.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {(false | string)} Return the matched date format if the cell value is a date string matching one known
 * date format, return `false` otherwise.
 */
export function isStringCellWithDateValue(cell: CellObject): false | string {
  if (!isStringCell(cell) && !isDateCell(cell)) {
    return false;
  }

  // Attempt to match Canadian date formats
  const matchedFormats = [DefaultDateFormat, DefaultDateFormatReverse, AltDateFormat, AltDateFormatReverse].filter(
    (format) => dayjs(String(cell.v), format, true).isValid()
  );

  if (matchedFormats.length === 1) {
    // Found 1 matching date format
    return matchedFormats[0];
  }

  // Attempt to match US date formats
  const matchedUSFormats = [
    USDefaultDateFormat,
    USDefaultDateFormatReverse,
    USAltDateFormat,
    USAltDateFormatReverse
  ].filter((format) => dayjs(String(cell.v), format, true).isValid());

  if (matchedUSFormats.length === 1) {
    // Found 1 matching date format
    return matchedUSFormats[0];
  }

  // Cell content does not match any supported date formats
  return false;
}

///**
// * Checks if the cell has a format, and if the format is likely a date format.
// *
// * @export
// * @param {CellObject} cell
// * @return {*}  {boolean} `true` if the cell has a date format, `false` otherwise.
// */
//export function doesCellHaveDateFormat(cell: CellObject): boolean {
//  if (!cell.z) {
//    return false;
//  }
//
//  // format contains `d` and/or `y` which are values only used in date formats
//  return String(cell.z).includes('d') || String(cell.z).includes('y');
//}

///**
// * Checks if the cell has a format, and if the format is likely a time format.
// *
// * @export
// * @param {CellObject} cell
// * @return {*}  {boolean} `true` if the cell has a time format, `false` otherwise.
// */
//export function doesCellHaveTimeFormat(cell: CellObject): boolean {
//  if (!cell.z) {
//    // Not a date cell and/or has no date format
//    return false;
//  }
//
//  // format contains `h` and/or `ss` which are values only used in time formats, or date formats that include time
//  return String(cell.z).includes('h') || String(cell.z).includes('ss');
//}
