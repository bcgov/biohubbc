import dayjs from 'dayjs';
import { pluralize } from './Utils';

/**
 * Combine date and time and return ISO string.
 *
 * @param {string} date - String date ie: '2024-01-01'
 * @param {string | null} [time] - Optional time ie: '00:10:10'
 * @returns {string} ISO date string
 */
export const combineDateTime = (date: string, time?: string | null) => {
  if (date && time) {
    return new Date(`${date}T${time}`).toISOString();
  }
  return new Date(`${date}T00:00:00`).toISOString();
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
  startDate: string,
  startTime: string | null,
  endDate: string,
  endTime: string | null
) => {
  const startDateTime = startTime ? dayjs(`${startDate} ${startTime}`) : dayjs(startDate);
  const endDateTime = endTime ? dayjs(`${endDate} ${endTime}`) : dayjs(endDate);

  // Calculate the total difference
  const years = endDateTime.diff(startDateTime, 'years');
  const days = endDateTime.diff(startDateTime, 'days') % 365;
  const hours = endDateTime.diff(startDateTime, 'hours') % 24;
  const minutes = endDateTime.diff(startDateTime, 'minutes') % 60;
  const seconds = endDateTime.diff(startDateTime, 'seconds') % 60;

  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${pluralize(years, 'year')}`);
  }
  if (days > 0) {
    parts.push(`${days} ${pluralize(days, 'day')}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${pluralize(hours, 'hour')}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${pluralize(minutes, 'minute')}`);
  }
  if (seconds > 0) {
    parts.push(`${seconds} ${pluralize(seconds, 'second')}`);
  }

  if (parts.length > 0) {
    // Slice to omit unnecessary level of detail. ie. If the duration is > 1 year, hours don't matter.
    return parts.slice(0, 2).join(' and ');
  }

  // Return null if no time difference
  return null;
};
