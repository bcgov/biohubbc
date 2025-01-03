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
  PeriodType extends { start_date: string; start_time: string | null; end_date: string; end_time: string | null }
>(
  period: PeriodType
) => {
  return `${period.start_date} ${period.start_time ?? ''} - ${period.end_date} ${period.end_time ?? ''}`;
};
