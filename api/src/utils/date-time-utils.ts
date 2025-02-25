import dayjs from 'dayjs';
import {
  DefaultDateFormat,
  DefaultDateFormatReverse,
  DefaultDateFormatSingleDigit,
  DefaultDateFormatSingleDigitReverse,
  DefaultTimeFormat,
  DefaultTimeFormat12Hour,
  DefaultTimeFormat12HourAlt,
  DefaultTimeFormat12HourNoSeconds,
  DefaultTimeFormat12HourNoSecondsAlt,
  DefaultTimeFormatNoSeconds,
  USDefaultDateFormat,
  USDefaultDateFormatReverse,
  USDefaultDateFormatSingleDigit,
  USDefaultDateFormatSingleDigitReverse
} from '../constants/dates';

/**
 * Converts a date + time string into a dayjs object.
 *
 * @param {string} date - The date string
 * @param {string} [time] - The time string
 * @returns {dayjs.Dayjs} - The dayjs object
 */
export function newDayjs(date: string, time?: string | null): dayjs.Dayjs {
  if (time) {
    return dayjs(`${date} ${time}`);
  }

  return dayjs(date);
}

/**
 * Check if a string is a date string.
 *
 * @example
 * isDateString('2021-01-01') // true
 * isDateString('2021-01-01T11:00:00') // true
 * isDateString('2021-01-01 11:00:00') // true
 *
 * isDateString('11:00:00') // false
 * isDateString('11:00') // false
 * isDateString('') // false
 *
 * @export
 * @param {string} value
 * @return {*}  {boolean}
 */
export function isDateString(value: string): boolean {
  if (!value) {
    return false;
  }

  return dayjs(value).isValid();
}

/**
 * Check if a string is a date-time string.
 *
 * @example
 * isDateTimeString('2021-01-01T11:00:00') // true
 * isDateTimeString('2021-01-01 11:00:00') // true
 *
 * isDateTimeString('2021-01-01') // false
 * isDateTimeString('11:00:00') // false
 * isDateTimeString('') // false
 *
 * @export
 * @param {string} value
 * @return {*}  {boolean}
 */
export function isDateTimeString(value: string): boolean {
  if (!value) {
    return false;
  }

  return isDateString(value) && (value.includes('T') || value.includes(':'));
}

/**
 * Check if a string is a time string.
 *
 * @example
 * isTimeString('11:00:00') // true
 * isTimeString('11:00') // true
 *
 * isTimeString('2021-01-01') // false
 * isTimeString('2021-01-01T11:00:00') // false
 * isTimeString('2021-01-01 11:00:00') // false
 * isTimeString('') // false
 *
 * @export
 * @param {string} value
 * @return {*}  {boolean}
 */
export function isTimeString(value: string): boolean {
  if (!value) {
    return false;
  }

  return dayjs(value, [DefaultTimeFormat, DefaultTimeFormatNoSeconds], true).isValid();
}

/**
 * Formats a date string to a date - prioritizes Canadian date formats over American date formats.
 *
 * @example formatDate('2025-01-01') // '2025-01-01'
 * @example formatDate('01/31/2025') // '2025-01-31'
 * @example formatDate('31-01-2025') // '2025-01-31'
 *
 * @export
 * @param {string} value -
 * @return {*} {string | null} - Date string or null if the cell value is not a date
 */
export function formatDateString(value: string): string | null {
  const dateParts = String(value).replace(/\//g, '-').split('-');

  // Check if the string is a 3 part delimited date
  if (dateParts.length !== 3) {
    return null;
  }

  // Generate a dayjs date object for both Canadian and American date formats
  // Why? There is a edge case where both the Canadian and American date formats are BOTH valid
  // but the date is generated incorrectly (01/31/2024 -> 2026-07-01).
  // We can determine the correct format by cross-referencing the year with the raw cell value.
  const canadianDate = dayjs(String(value), [
    DefaultDateFormat,
    DefaultDateFormatReverse,
    DefaultDateFormatSingleDigit,
    DefaultDateFormatSingleDigitReverse
  ]);

  const americanDate = dayjs(String(value), [
    USDefaultDateFormat,
    USDefaultDateFormatReverse,
    USDefaultDateFormatSingleDigit,
    USDefaultDateFormatSingleDigitReverse
  ]);

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
 * Formats a time string to a time ignoring AM/PM suffixes.
 *
 * @example formatTimeString('10:00') // '10:00:00'
 * @example formatTimeString('10:00:00') // '10:00:00'
 * @example formatTimeString('10:00:00 AM') // '10:00:00'
 * @example formatTimeString('10:00:00 PM') // '22:00:00'
 */
export function formatTimeString(value: string): string | null {
  let timeString = value.toLowerCase();

  // Time strings are expected to be in the formats:
  // 'hh:mm:ss' or 'hh:mm' or 'hh:mm:ss am' or 'hh:mm:ss pm'
  const timeParts = timeString.split(':');

  // Check if the string is a 2 or 3 part delimited time string
  if (timeParts.length < 2 || timeParts.length > 3) {
    return null;
  }

  const hours = Number(timeParts[0]);

  // If the time is 24 hour time, remove the PM suffix
  if (hours > 12 && timeString.includes('pm')) {
    // Remove ' pm' and 'pm' suffixes - case insensitive
    timeString = timeString.replace('pm', '').replace(' ', '');
  }

  // Convert the time string to a dayjs object
  const time = dayjs(
    timeString,
    [
      DefaultTimeFormat,
      DefaultTimeFormatNoSeconds,
      DefaultTimeFormat12Hour,
      DefaultTimeFormat12HourNoSeconds,
      DefaultTimeFormat12HourAlt,
      DefaultTimeFormat12HourNoSecondsAlt
    ],
    true
  );

  if (!time.isValid()) {
    return null;
  }

  return time.format(DefaultTimeFormat);
}
