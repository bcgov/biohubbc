import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { CellObject } from 'xlsx';
import {
  DefaultDateFormat,
  DefaultDateFormatReverse,
  DefaultTimeFormat,
  USDefaultDateFormat,
  USDefaultDateFormatReverse
} from '../../constants/dates';
import { safeTrim } from '../string-utils';
import { CUSTOM_XLSX_DATE_FORMAT } from './worksheet-utils';

dayjs.extend(duration);

type CellValue = CellObject['v'];

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
 * @param {CellObject} cell - Cell object
 * @return {*} {CellObject} - Updated cell object
 */
export function replaceCellDates(cell: CellObject): CellObject {
  if (!cell.v) {
    // Cell has no value
    return cell;
  }

  // If a date cell - convert the raw value (ie: '01-01-2024') to a date string (ie: '2024-01-01')
  if (isDateCell(cell)) {
    // Use the formatted value ('2024-01-01') instead of the epoch number (434565)
    // Why? The epoch number is inconsistent and is affected by the dateNF option.
    // Same dates with different incomming formats will have different epoch values.
    const date = formatDateCellValue(cell.w);

    return { ...cell, z: DefaultDateFormat, v: date ?? 'Invalid Date Format' };
  }
  // If time cell - convert the epoch value (ie: 0.5) to a time string (ie: '12:00:00')
  else if (isTimeCell(cell)) {
    const time = dayjs.duration(Number(cell.v), 'days');

    return { ...cell, z: DefaultTimeFormat, v: time.format(DefaultTimeFormat) };
  }
  // If a string cell - check if the string is a date and convert it to a date string
  else if (cell.z !== CUSTOM_XLSX_DATE_FORMAT && isStringCell(cell)) {
    const date = formatDateCellValue(cell.v);

    // If the string is a date, update the cell value to the formatted date string
    if (date) {
      return { ...cell, z: DefaultDateFormat, v: date };
    }
  }

  return cell;
}

/**
 * Converts a cell value to a date string - prioritizes Canadian date formats over American date formats.
 *
 * @export
 * @param {CellValue} cellValue - Cell value
 * @return {*} {string | null} - Date string or null if the cell value is not a date
 */
export function formatDateCellValue(cellValue: CellValue): string | null {
  const dateParts = String(cellValue).replace(/\//g, '-').split('-');

  // Check if the string is a 3 part delimited date
  if (dateParts.length !== 3) {
    return null;
  }

  // Generate a dayjs date object for both Canadian and American date formats
  // Why? There is a edge case where both the Canadian and American date formats are BOTH valid
  // but the date is generated incorrectly (01/31/2024 -> 2026-07-01).
  // We can determine the correct format by cross-referencing the year with the raw cell value.
  const canadianDate = dayjs(String(cellValue), [DefaultDateFormat, DefaultDateFormatReverse]);
  const americanDate = dayjs(String(cellValue), [USDefaultDateFormat, USDefaultDateFormatReverse]);

  if (!canadianDate.isValid() && !americanDate.isValid()) {
    return null;
  }

  // Grab the year from the date string
  const dateYear = Number(dateParts[0].length === 4 ? dateParts[0] : dateParts[2]);

  // Always prioritize Canadian date formats over American date formats
  if (canadianDate.year() === dateYear) {
    return canadianDate.format(DefaultDateFormat);
  }

  if (americanDate.year() === dateYear) {
    return americanDate.format(DefaultDateFormat);
  }

  return null;
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
 * Checks if the cell is a date cell.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {boolean} `true` if the cell is a date cell, `false` otherwise.
 */
export function isDateCell(cell: CellObject): boolean {
  return cell.z === CUSTOM_XLSX_DATE_FORMAT && typeof cell.v === 'number' && cell.v >= 1;
}

/**
 * Checks if the cell is a time cell.
 *
 * Note: This will not detect time cells like `10:00` as they are formatted as strings.
 * Only detects time cells that are formatted as epoch percentages ie: 0.5.
 *
 * @export
 * @param {CellObject} cell
 * @return {*}  {boolean} `true` if the cell is a date cell, `false` otherwise.
 */
export function isTimeCell(cell: CellObject): boolean {
  return cell.z === CUSTOM_XLSX_DATE_FORMAT && typeof cell.v === 'number' && cell.v < 1 && cell.v >= 0;
}
