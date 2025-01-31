/**
 * Get the label for a sampling period.
 *
 * Combines the start_date, start_time, end_date, and end_time properties of the period into a single string.
 *
 * @template PeriodType A type that has at least start_date, start_time, end_date, and end_time properties.
 * @param {PeriodType} period
 * @return {*}
 */
export const getPeriodLabel = <
  PeriodType extends {
    start_date: string | null;
    start_time: string | null;
    end_date: string | null;
    end_time: string | null;
  }
>(
  period: PeriodType
) => {
  if (!period.start_date || !period.end_date) {
    return '';
  }

  const startTimeString = period.start_time ? ` ${period.start_time}` : ''; // includes leading space
  const endTimeString = period.end_time ? ` ${period.end_time}` : ''; // includes leading space

  return `${period.start_date}${startTimeString} - ${period.end_date}${endTimeString}`;
};
