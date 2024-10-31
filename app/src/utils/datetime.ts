import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { pluralize } from './Utils';

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
    return new Date(`${date}T${time}`).toISOString();
  }
  return new Date(`${date}T00:00:00`).toISOString();
};

/**
 * Formats the time difference between two timestamps into a human-readable string.
 *
 * @param {string} startDate
 * @param {string|null} startTime
 * @param {string} endDate
 * @param {string|null} endTime
 * @returns {string|null}
 */
export const formatTimeDifference = (
  startDate: string,
  startTime: string | null,
  endDate: string,
  endTime: string | null
) => {
  const startDateTime = startTime ? dayjs(`${startDate} ${startTime}`) : dayjs(startDate);
  const endDateTime = endTime ? dayjs(`${endDate} ${endTime}`) : dayjs(endDate);

  // Calculate the difference in milliseconds
  const diff = endDateTime.diff(startDateTime);

  // Calculate years, days, hours, minutes, and seconds
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 365);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  // Construct the time difference string
  const formatParts = [];

  if (years > 0) formatParts.push(`${years} ${pluralize(years, 'year')}`);
  if (days > 0) formatParts.push(`${days} ${pluralize(days, 'day')}`);
  if (hours > 0) formatParts.push(`${hours} ${pluralize(hours, 'hour')}`);
  if (minutes > 0) formatParts.push(`${minutes} ${pluralize(minutes, 'minute')}`);
  if (seconds > 0) formatParts.push(`${seconds} ${pluralize(seconds, 'second')}`);

  // Return formatted string.
  // Slice to omit unnecessary detail with the assumption that if the duration is > 1 hour, seconds do not matter, if > 1 year, minutes do not matter, etc.
  // If duration is 0, return null
  return formatParts.length > 0 ? formatParts.slice(0, 2).join(' and ') : null;
};
