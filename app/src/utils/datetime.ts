import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { pluralize } from './Utils';

const TIMESTAMP_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

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
 * @param {string | null} startTime
 * @param {string} endDate
 * @param {string | null} endTime
 * @returns {string | null} A formatted string indicating an amount of time
 */
export const formatTimeDifference = (
  startDate?: string | null,
  startTime?: string | null,
  endDate?: string | null,
  endTime?: string | null
): string | null => {
  const startDateTime = startTime ? dayjs(`${startDate} ${startTime}`) : dayjs(startDate);
  const endDateTime = endTime ? dayjs(`${endDate} ${endTime}`) : dayjs(endDate);

  if (!startDateTime.isValid() || !endDateTime.isValid()) {
    return null;
  }

  // Calculate the total difference
  const diff = dayjs.duration(endDateTime.diff(startDateTime));

  const parts = [];

  for (const unit of ['year', 'month', 'day', 'hour', 'minute', 'second']) {
    const value = diff[`${unit}s`]();

    if (value > 0) {
      parts.push(`${value} ${pluralize(value, unit)}`);
    }
  }

  if (!parts.length) {
    return null;
  }

  return parts.slice(0, 2).join(' and ');
};
