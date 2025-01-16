import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
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
dayjs.extend(customParseFormat);

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
 * Note: Mutates the cell object in place.
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

  // Check if epoch numeric date (v: 434565)
  if (cell.z === CUSTOM_XLSX_DATE_FORMAT && cell.v >= 1) {
    const date = formatDateCellValue(cell.w); // Use the formatted value ('2024-01-01') instead of the epoch number (434565)

    cell.z = DefaultDateFormat;
    cell.v = date ?? 'Invalid Date Format';
  }
  // Check if epoch numeric time (v: 0.5)
  else if (cell.z === CUSTOM_XLSX_DATE_FORMAT && cell.v < 1 && cell.v >= 0) {
    const time = dayjs.duration(Number(cell.v), 'days');

    cell.z = DefaultTimeFormat;
    cell.v = time.format(DefaultTimeFormat);
  }
  // Check non-date string cells (v: '2024-01-01')
  else if (cell.z !== CUSTOM_XLSX_DATE_FORMAT && isStringCell(cell) && dayjs(String(cell.v)).isValid()) {
    const date = formatDateCellValue(cell.z);

    cell.z = DefaultDateFormat;
    cell.v = date ?? 'Invalid Date Format';
  }

  return cell;
}

export function formatDateCellValue(cellValue: CellValue): string | null {
  const dateParts = String(cellValue).replace(/\//g, '-').split('-');

  // Check if the string is a 3 part delimited date
  if (dateParts.length !== 3) {
    return null;
  }

  // Generate a dayjs date object for both Canadian and American date formats
  // Why? There is a edge case where both the Canadian and American date formats are BOTH valid
  // but the date is generated incorrectly (01/31/2024 -> 2026-07-01).
  // By checking if the year matches with the cell we can determine which format is correct.
  const canadianDate = dayjs(String(cellValue), [DefaultDateFormat, DefaultDateFormatReverse]);
  const americanDate = dayjs(String(cellValue), [USDefaultDateFormat, USDefaultDateFormatReverse]);

  if (!canadianDate.isValid() && !americanDate.isValid()) {
    return null;
  }

  const dateYear = Number(dateParts[0].length === 4 ? dateParts[0] : dateParts[2]);

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
