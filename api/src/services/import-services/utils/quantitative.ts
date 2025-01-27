import { CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';

interface IQuantitativeTypeDefinitionStub {
  quantitative_id: string; // UUID
  min: number | null;
  max: number | null;
}

interface IQuantitativeValidationResult {
  quantitative_id: string;
  value: number;
}

export const validateQuantitativeCellValue = (
  cell: unknown,
  quantitativeTypeDefinition: IQuantitativeTypeDefinitionStub
): CSVError[] | IQuantitativeValidationResult => {
  // Quantitative environments are numbers ie: antler count: 2
  if (typeof cell !== 'number') {
    return [
      {
        error: 'Quantitative cell value must be a number',
        solution: 'Update the cell value to match the expected type'
      }
    ];
  }

  const errors: CSVError[] = [];

  // Validate cell value is withing the environment min max bounds
  if (quantitativeTypeDefinition.max != null && cell > quantitativeTypeDefinition.max) {
    errors.push({
      error: 'Quantitative cell value too large',
      solution: `Value must be less than or equal to ${quantitativeTypeDefinition.max}`
    });
  }

  // Validate cell value is withing the environment min max bounds
  if (quantitativeTypeDefinition.min != null && cell < quantitativeTypeDefinition.min) {
    errors.push({
      error: 'Quantitative cell value too small',
      solution: `Value must be greater than or equal to ${quantitativeTypeDefinition.min}`
    });
  }

  if (errors.length) {
    return errors;
  }

  return {
    quantitative_id: quantitativeTypeDefinition.quantitative_id,
    value: cell
  };
};
