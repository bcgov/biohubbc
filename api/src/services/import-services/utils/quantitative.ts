import { CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';

interface IQuantitativeTypeDefinitionStub {
  /**
   * The minimum value the quantitative value can be
   *
   * @type {number}
   */
  min: number | null;
  /**
   * The maximum value the quantitative value can be
   *
   * @type {number}
   */
  max: number | null;
}

/**
 * Validate a quantitative value against the quantitative type definition.
 *
 * Rules:
 *  1. Quantitative values are numbers ie: 2
 *  2. Quantitative values must be within the min max bounds ie: 0 <= value <= 10
 *
 * @param {unknown} value - The value to validate
 * @param {IQuantitativeTypeDefinitionStub} quantitativeTypeDefinition - The quantitative type definition
 * @param {string} [quantitativeTag] - The tag to inject into the error message ie: 'measurement' or 'environment'
 * @returns {CSVError[] | number} - The list of errors or the quantitative value
 */
export const validateQuantitativeValue = (
  value: unknown,
  quantitativeTypeDefinition: IQuantitativeTypeDefinitionStub,
  quantitativeTag?: string
): CSVError[] | number => {
  const errors: CSVError[] = [];
  const quantitativeTagString = quantitativeTag ? ` ${quantitativeTag}` : '';

  // Quantitative are numbers ie: antler count: 2
  if (typeof value !== 'number') {
    return [
      {
        error: `Quantitative${quantitativeTagString} value must be a number`,
        solution: 'Update the value to match the expected type'
      }
    ];
  }

  // Validate value is within min max bounds
  if (quantitativeTypeDefinition.max != null && value > quantitativeTypeDefinition.max) {
    errors.push({
      error: `Quantitative${quantitativeTagString} value too large`,
      solution: `Value must be less than or equal to ${quantitativeTypeDefinition.max}`
    });
  }

  // Validate value is within the min max bounds
  if (quantitativeTypeDefinition.min != null && value < quantitativeTypeDefinition.min) {
    errors.push({
      error: `Quantitative${quantitativeTagString} value too small`,
      solution: `Value must be greater than or equal to ${quantitativeTypeDefinition.min}`
    });
  }

  if (errors.length) {
    return errors;
  }

  return value;
};
