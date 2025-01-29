import { CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';

interface IQualitativeTypeDefinitionStub {
  /**
   * The qualitative type definition ID
   *
   * @type {string} - UUID
   */
  qualitative_id: string; // UUID
  /**
   * The allowed options for the qualitative value
   *
   * @type {Array<{ option_id: string; option_name: string }>}
   */
  options: {
    /**
     * The qualitative option ID
     *
     * @type {string} - UUID
     */
    option_id: string;
    /**
     * The qualitative option name
     *
     * @type {string}
     */
    option_name: string;
  }[];
}

/**
 * Validate a qualitative value against the qualitative type definition.
 *
 * Rules:
 *  1. Qualitative values are strings ie: 'red'
 *  2. Qualitative values must be one of the allowed options ie: ['red', 'blue', 'green']
 *  3. Qualitative values are case insensitive ie: 'Red' === 'red'
 *
 * @param {unknown} value - The value to validate
 * @param {IQualitativeTypeDefinitionStub} qualitativeTypeDefinition - The qualitative type definition
 * @returns {CSVError[] | string} - The list of errors or the qualitative value
 */
export const validateQualitativeValue = (
  value: unknown,
  qualitativeTypeDefinition: IQualitativeTypeDefinitionStub
): CSVError[] | string => {
  if (typeof value !== 'string') {
    return [
      {
        error: 'Qualitative value must be a string',
        solution: 'Update the value to match the expected type'
      }
    ];
  }

  const matchingOptionValue = qualitativeTypeDefinition.options.find(
    // Not sure why I need to cast params.value to string here after checking above...
    (option) => option.option_name.toLowerCase() === String(value).toLowerCase()
  );

  // Validate value is an alowed qualitative environment option
  if (!matchingOptionValue) {
    return [
      {
        error: `Invalid qualitative option`,
        solution: `Use a valid qualitative option`,
        values: qualitativeTypeDefinition.options.map((option) => option.option_name)
      }
    ];
  }

  return qualitativeTypeDefinition.qualitative_id;
};
