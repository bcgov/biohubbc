import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Simplified Capture interface
interface ICaptureStub {
  capture_id: string;
  capture_date: string;
  capture_time?: string | null;
}

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
export const formatTimeString = (time?: string | null): string | undefined => {
  const fullTime = dayjs(time, 'HH:mm:ss');
  const shortTime = dayjs(time, 'HH:mm');

  if (fullTime.isValid()) {
    return fullTime.format('HH:mm:ss');
  }

  if (shortTime.isValid()) {
    return shortTime.format('HH:mm:ss');
  }
};

/**
 * Checks if two date strings are equal.
 *
 * Note: This will attempt to unify the formatting between the dates.
 * ie: 2024-01-01 === 01-01-2024
 *
 * @param {string} _dateA - Date string
 * @param {string} _dateB - Date string
 * @returns {string | undefined}
 */
export const areDatesEqual = (_dateA: string, _dateB: string): boolean => {
  return dayjs(_dateA).isSame(dayjs(_dateB));
};

/**
 * Find Captures from Capture date and time fields.
 *
 * @template {T} Capture stub
 * @param {ICapture[]} captures - Array of Critterbase captures
 * @param {string} captureDate - String date
 * @param {string} captureTime - String time
 * @returns {T[]} Capture ID or undefined
 */
export const findCapturesFromDateTime = <T extends ICaptureStub>(
  captures: T[],
  captureDate: string,
  captureTime: string
): T[] => {
  return captures.filter((capture) => {
    return (
      formatTimeString(capture.capture_time) === formatTimeString(captureTime) &&
      areDatesEqual(capture.capture_date, captureDate)
    );
  });
};
