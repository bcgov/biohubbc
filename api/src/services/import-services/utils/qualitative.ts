import { CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';

interface IQualitativeTypeDefinitionStub {
  qualitative_id: string; // UUID
  options: {
    option_id: string; // UUID
    option_name: string;
  }[];
}

export const validateQualitativeValue = (
  value: unknown,
  qualitativeTypeDefinition: IQualitativeTypeDefinitionStub
): CSVError[] | string => {
  if (typeof value !== 'string') {
    return [
      {
        error: 'Qualitative value value must be a string',
        solution: 'Update the value value to match the expected type'
      }
    ];
  }

  const matchingOptionValue = qualitativeTypeDefinition.options.find(
    // Not sure why I need to cast params.value to string here after checking above...
    (option) => option.option_name.toLowerCase() === String(value).toLowerCase()
  );

  // Validate value value is an alowed qualitative environment option
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
