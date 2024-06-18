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
