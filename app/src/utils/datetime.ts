import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

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
 * Displays the time difference between two timestamps in a human-readable way (eg. 30 seconds, 5 minutes, 2 years)
 *
 * @param {string} startDate
 * @param {string|null} startTime
 * @param {string} endDate
 * @param {string | null} endTime
 * @returns {string} 
 */
export const humanizeTimeDifference = (
  startDate: string,
  startTime: string | null,
  endDate: string,
  endTime: string | null
) => {
  const startDateTime = startTime ? dayjs(`${startDate} ${startTime}`) : dayjs(startDate);
  const endDateTime = endTime ? dayjs(`${endDate} ${endTime}`) : dayjs(endDate);

  // Calculate the difference in milliseconds
  const diff = endDateTime.diff(startDateTime);

  return dayjs.duration(diff, 'millisecond').humanize();
};
