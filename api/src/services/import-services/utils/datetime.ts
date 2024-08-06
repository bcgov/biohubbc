import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Format time strings to correct format for Zod and external systems.
 *
 * `10:10`   -> `10:10:00` appends seconds if missing
 * `9:10:10` -> `09:10:10` prepends `0` for 24 hour time
 * `9:10`    -> `09:10:00` does both
 *
 * @param {string} [time] - Time string
 * @returns {string | undefined}
 */
export const formatTimeString = (time?: string): string | undefined => {
  const fullTime = dayjs(time, 'HH:mm:ss');
  const shortTime = dayjs(time, 'HH:mm');

  if (fullTime.isValid()) {
    return fullTime.format('HH:mm:ss');
  }

  if (shortTime.isValid()) {
    return shortTime.format('HH:mm:ss');
  }
};
