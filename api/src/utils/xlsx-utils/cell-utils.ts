import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { CellObject } from 'xlsx';
import { DefaultDateFormat, DefaultTimeFormat } from '../../constants/dates';
import { formatDateString, formatTimeString } from '../date-time-utils';
import { safeTrim } from '../string-utils';
import { CUSTOM_XLSX_DATE_FORMAT } from './worksheet-utils';

//const NUM_SECONDS_IN_DAY = 86400;
//const NUM_MILLISECONDS_IN_DAY = 86400000;

dayjs.extend(duration);

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
    const date = formatDateString(String(cell.w));

    return { ...cell, z: DefaultDateFormat, v: date ?? 'Invalid Date Format' };
  }
  // If time cell - convert the epoch value (ie: 0.5) to a time string (ie: '12:00:00')
  else if (isTimeCell(cell)) {
    // Round the time fraction to the nearest millisecond to avoid floating point errors
    // Excel stores time as a fraction of a day, where each day has 86400000 milliseconds.
    // Ex: 0.25 is 6:00:00 AM, 0.5 is 12:00:00 PM, 0.75 is 6:00:00 PM
    const roundedTimeFraction = Math.round(Number(cell.v) * 86400000) / 86400000;
    const time = dayjs.duration(roundedTimeFraction, 'days');

    return { ...cell, z: DefaultTimeFormat, v: time.format(DefaultTimeFormat) };
  }
  // If a string cell - check if the string is a date and convert it to a date string
  else if (cell.z !== CUSTOM_XLSX_DATE_FORMAT && isStringCell(cell)) {
    const date = formatDateString(String(cell.v));

    // If the string is a date, update the cell value to the formatted date string
    if (date) {
      return { ...cell, z: DefaultDateFormat, v: date };
    }

    // If the string is a time, update the cell value to the formatted time string
    // ie: '10:00' -> '10:00:00' or '10:00:00 AM' -> '10:00:00'
    const time = formatTimeString(String(cell.v));

    if (time) {
      return { ...cell, z: DefaultTimeFormat, v: time };
    }
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
