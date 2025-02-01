import dayjs from 'dayjs';
import { DefaultTimeFormat, DefaultTimeFormatNoSeconds } from '../constants/dates';

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
