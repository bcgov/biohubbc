import dayjs from 'dayjs';
import duration, { DurationUnitType } from 'dayjs/plugin/duration';
import { pluralize } from './Utils';
import { DATE_FORMAT } from 'constants/dateTimeFormats';

const TIMESTAMP_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

dayjs.extend(duration);

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
 * Determines if the time should be shown based on the capture time.
 *
 * @param {string} [capture_time]
 * @returns {boolean}
 */
export function shouldShowTime(capture_time?: string): boolean {
  if (!capture_time) return false;
  const time = dayjs(capture_time, ['HH:mm', 'HH:mm:ss', 'h:mm A']);
  return time.format('HH:mm') !== '00:00' && time.format('h:mm A') !== '12:00 AM';
}

/**
 * Formats a capture label based on the date and optional time.
 *
 * @param {string} date
 * @param {string} [time]
 * @returns {string}
 */
export function formatCaptureLabel(date: string, time?: string): string {
  if (shouldShowTime(time)) {
    return dayjs(`${date} ${time}`).format(DATE_FORMAT.LongDateTimeFormat);
  }
  return dayjs(date).format(DATE_FORMAT.MediumDateFormat);
}
