/**
 * Validates any qualitative cell value against the provided options.
 * If the value does not match any of the valid options, `false` is returned.
 *
 * @param {string} cellValue the value of the cell to validate (expected to match one of the option ids)
 * @param {string[]} optionNames the valid option names for the column
 * @return {*}  {boolean}
 */
export function isQualitativeValueValid(cellValue: string, optionNames: string[]): boolean {
  return optionNames.includes(cellValue);
}

/**
 * Validates any quantitative cell value against the provided min and max values.
 * If the value is outside of the valid range, `false` is returned.
 *
 * @param {number} cellValue the value of the cell to validate (expected to be within the min and max values, if set)
 * @param {(number | null)} minValue the minimum value for the column
 * @param {(number | null)} maxValue the maximum value for the column
 * @return {*}  {boolean}
 */
export function isQuantitativeValueValid(cellValue: number, minValue: number | null, maxValue: number | null): boolean {
  if (minValue !== null && maxValue !== null && (cellValue < minValue || cellValue > maxValue)) {
    // Both min and max values are set and the cell value is outside of the valid range
    return false;
  }

  if (minValue !== null && cellValue < minValue) {
    // Only the min value is set and the cell value is less than the min value
    return false;
  }

  if (maxValue !== null && cellValue > maxValue) {
    // Only the max value is set and the cell value is greater than the max value
    return false;
  }

  // The cell value is within the valid range or no range is set
  return true;
}
