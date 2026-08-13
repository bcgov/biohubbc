import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import duration, { DurationUnitType } from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { pluralize } from './Utils';

const TIMESTAMP_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

dayjs.extend(duration);
dayjs.extend(utc);

/**
 * Combine date and time and return ISO string.
 *
 * @param {string} date - String date ie: '2024-01-01'
 * @param {string | null} [time] - Optional time ie: '00:10:10'
 * @returns {string} ISO date string
 */
export const combineDateTime = (date: string, time?: string | null) => {
  if (date && time) {
    return dayjs(`${date} ${time}`).format(TIMESTAMP_FORMAT);
  }

  return dayjs(`${date}`).format(TIMESTAMP_FORMAT);
};

/**
 * Combine date and time and return an ISO 8601 string, treating the incoming values as UTC.
 *
 * The wall-clock value provided is the value returned (no conversion from the browser's local timezone).
 *
 * @example combineDateTimeUtc('2024-01-01', '22:30:00') // '2024-01-01T22:30:00.000Z'
 *
 * @param {string} date - String date ie: '2024-01-01'
 * @param {string} time - String time ie: '22:30:00'
 * @returns {string} ISO 8601 UTC date string
 */
export const combineDateTimeUtc = (date: string, time: string): string => {
  return dayjs.utc(`${date}T${time}`).toISOString();
};

/**
 * Format a timestamp in UTC.
 *
 * The incoming timestamp may include a timezone offset (ie. postgres timestamptz output: '2024-01-01 14:30:00-08');
 * the output renders the equivalent UTC wall-clock value (no conversion to the browser's local timezone).
 *
 * @param {string | null} [timestamp] - Timestamp string, with or without a timezone offset
 * @param {string} format - Dayjs format string ie: 'HH:mm:ss'
 * @returns {string} The timestamp formatted in UTC, or an empty string if the timestamp is falsy or invalid
 */
export const formatTimestampUtc = (timestamp: string | null | undefined, format: string): string => {
  if (!timestamp) {
    return '';
  }

  const date = dayjs(timestamp);

  if (!date.isValid()) {
    return '';
  }

  return date.utc().format(format);
};

/**
 * Returns true if the timestamp has a time not equal to midnight (00:00:00), otherwise returns false.
 *
 * @param {string} date
 * @returns {boolean}
 */
export const hasRealTime = (date: string): boolean => {
  const dt = dayjs(date);
  const hasRealTime = dt.format('HH:mm:ss') !== '00:00:00';

  return hasRealTime;
};
/**
 * Formats the time difference between two timestamps into a human-readable string.
 *
 * @param {string} startDate
 * @param {(string | null)} startTime
 * @param {string} endDate
 * @param {(string | null)} endTime
 * @returns {string | null} A formatted string indicating an amount of time
 */
export const formatTimeDifference = (
  startDate: string,
  startTime: string | null,
  endDate: string,
  endTime: string | null
): string | null => {
  const startDateTime = startTime ? dayjs(`${startDate} ${startTime}`) : dayjs(startDate);
  const endDateTime = endTime ? dayjs(`${endDate} ${endTime}`) : dayjs(endDate);

  if (!startDateTime.isValid() || !endDateTime.isValid()) {
    return null;
  }

  // Calculate the total difference
  const diff = dayjs.duration(endDateTime.diff(startDateTime));

  const parts = [];
  const units: DurationUnitType[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];

  for (const unit of units) {
    const value = diff.get(unit);

    if (value > 0) {
      parts.push(`${value} ${pluralize(value, unit)}`);
    }
  }

  if (!parts.length) {
    return null;
  }

  return parts.slice(0, 2).join(' and ');
};

/**
 * Get a label for a date time range.
 *
 * @param {(string | null)} startDate
 * @param {(string | null)} startTime
 * @param {(string | null)} endDate
 * @param {(string | null)} endTime
 * @return {*}  {string} A formatted label of the form: `'start_date[ start_time] - end_date[ end_time]'` or an
 * empty string; if either start or end date is missing.
 */
export const getDateTimeLabel = (
  startDate: string | null,
  startTime: string | null,
  endDate: string | null,
  endTime: string | null
): string => {
  if (!startDate || !endDate) {
    return '';
  }

  const startTimeString = startTime ? ` ${startTime}` : ''; // includes leading space
  const endTimeString = endTime ? ` ${endTime}` : ''; // includes leading space

  return `${startDate}${startTimeString} - ${endDate}${endTimeString}`;
};

/**
 * Format date and optional time with separate formats.
 *
 * @param {string} date - Date string, e.g., '2024-01-01'
 * @param {string | null} [time] - Optional time string, e.g., '14:30'
 * @param {string} [dateFormat] - Format to use if only date is provided
 * @param {string} [dateTimeFormat] - Format to use if date and time are provided
 * @returns {string} - Formatted date/time string
 */
export const formatDateTime = (
  date: string,
  time?: string | null,
  dateFormat: string = DATE_FORMAT.MediumDateFormat,
  dateTimeFormat: string = DATE_FORMAT.MediumDateTimeFormat
): string => {
  const hasTime = Boolean(time);
  const dateTimeStr = hasTime ? `${date} ${time}` : date;
  const format = hasTime ? dateTimeFormat : dateFormat;

  return dayjs(dateTimeStr).format(format);
};
