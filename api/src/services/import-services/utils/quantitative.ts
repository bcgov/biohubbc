import { CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';

interface IQuantitativeTypeDefinitionStub {
  quantitative_id: string; // UUID
  min: number | null;
  max: number | null;
}

export const validateQuantitativeValue = (
  value: unknown,
  quantitativeTypeDefinition: IQuantitativeTypeDefinitionStub
): CSVError[] | number => {
  const errors: CSVError[] = [];

  // Quantitative environments are numbers ie: antler count: 2
  if (typeof value !== 'number') {
    return [
      {
        error: 'Quantitative value value must be a number',
        solution: 'Update the value value to match the expected type'
      }
    ];
  }

  // Validate value value is withing the environment min max bounds
  if (quantitativeTypeDefinition.max != null && value > quantitativeTypeDefinition.max) {
    errors.push({
      error: 'Quantitative value value too large',
      solution: `Value must be less than or equal to ${quantitativeTypeDefinition.max}`
    });
  }

  // Validate value value is withing the environment min max bounds
  if (quantitativeTypeDefinition.min != null && value < quantitativeTypeDefinition.min) {
    errors.push({
      error: 'Quantitative value value too small',
      solution: `Value must be greater than or equal to ${quantitativeTypeDefinition.min}`
    });
  }

  if (errors.length) {
    return errors;
  }

  return value;
};
