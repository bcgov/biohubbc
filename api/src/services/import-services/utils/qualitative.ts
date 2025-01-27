import { CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';

interface IQualitativeTypeDefinitionStub {
  qualitative_id: string; // UUID
  options: {
    option_id: string; // UUID
    option_name: string;
  }[];
}

interface IQualitativeValidationResult {
  qualitative_id: string;
  option_id: string;
  option_name: string;
}

export const validateQualitativeCellValue = (
  cell: unknown,
  qualitativeTypeDefinition: IQualitativeTypeDefinitionStub
): CSVError[] | IQualitativeValidationResult => {
  if (typeof cell !== 'string') {
    return [
      {
        error: 'Qualitative cell value must be a string',
        solution: 'Update the cell value to match the expected type'
      }
    ];
  }

  const matchingOptionValue = qualitativeTypeDefinition.options.find(
    // Not sure why I need to cast params.cell to string here after checking above...
    (option) => option.option_name.toLowerCase() === String(cell).toLowerCase()
  );

  // Validate cell value is an alowed qualitative environment option
  if (!matchingOptionValue) {
    return [
      {
        error: `Invalid qualitative option`,
        solution: `Use a valid qualitative option`,
        values: qualitativeTypeDefinition.options.map((option) => option.option_name)
      }
    ];
  }

  return {
    qualitative_id: qualitativeTypeDefinition.qualitative_id,
    option_id: matchingOptionValue.option_id,
    option_name: matchingOptionValue.option_name
  };
};
