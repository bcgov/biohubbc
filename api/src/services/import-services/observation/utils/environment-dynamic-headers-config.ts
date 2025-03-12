import {
  ObservationSubCountQualitativeEnvironmentRecord,
  ObservationSubCountQuantitativeEnvironmentRecord,
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../../../repositories/observation-subcount-environment-repository';
import { CSVCellValidator, CSVError, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import {
  EnvironmentNameTypeDefinitionMap,
  isQualitativeEnvironmentTypeDefinition,
  isQuantitativeEnvironmentTypeDefinition
} from '../../utils/environment';
import { validateQualitativeValue } from '../../utils/qualitative';
import { validateQuantitativeValue } from '../../utils/quantitative';
import { updateCSVRowState } from '../../utils/row-state';

/**
 * Get the dynamic environment cell validator.
 *
 * Rules:
 *  1. The header must be a valid SIMS environment (qualitative or quantitative) or undefined
 *
 * @param {EnvironmentNameTypeDefinitionMap} environmentMap The environment map
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDynamicEnvironmentCellValidator = (
  environmentMap: EnvironmentNameTypeDefinitionMap
): CSVCellValidator => {
  return (params) => {
    if (params.cell === undefined) {
      return [];
    }

    const environment = environmentMap.get(params.header);

    if (!environment) {
      return [
        {
          error: `Column header '${params.header}' does not exist`,
          solution: 'Use a valid environment as the header',
          values: Object.keys(environmentMap)
        }
      ];
    }

    // Environment type is qualitative
    if (isQualitativeEnvironmentTypeDefinition(environment)) {
      return validateQualitativeEnvironmentCell(params, environment);
    }

    // Environment type is quantitative
    if (isQuantitativeEnvironmentTypeDefinition(environment)) {
      return validateQuantitativeEnvironmentCell(params, environment);
    }

    // Can this path ever be reached?
    return [
      {
        error: 'Invalid environment type',
        solution: 'Use a supported environment type'
      }
    ];
  };
};

/**
 * Validate the qualitative environment cell value.
 *
 * @param {CSVParams} params The CSV params
 * @param {QualitativeEnvironmentTypeDefinition} environment The qualitative environment definition
 * @returns {CSVError[]} The list of errors
 */
export const validateQualitativeEnvironmentCell = (
  params: CSVParams,
  environment: QualitativeEnvironmentTypeDefinition
): CSVError[] => {
  const options = environment.options.map((option) => ({
    option_id: option.environment_qualitative_option_id,
    option_name: option.name
  }));

  // Normalize the environment type definition and validate the cell
  const result = validateQualitativeValue(params.cell, { options: options }, 'environment');

  // If the result is not a qualitative value it is a list of CSV errors
  if (typeof result !== 'string') {
    return result;
  }

  // Update the row state with the taxon environment id and qualitative option id
  updateCSVRowState(params.row, {
    [params.header]: {
      environment_qualitative_id: environment.environment_qualitative_id,
      environment_qualitative_option_id: result
    } satisfies Pick<
      ObservationSubCountQualitativeEnvironmentRecord,
      'environment_qualitative_id' | 'environment_qualitative_option_id'
    >
  });

  return [];
};

/**
 * Validate the quantitative environment cell value.
 *
 * @param {CSVParams} params The CSV params
 * @param {QuantitativeEnvironmentTypeDefinition} environment The quantitative environment definition
 * @returns {CSVError[]} The list of errors
 */
export const validateQuantitativeEnvironmentCell = (
  params: CSVParams,
  environment: QuantitativeEnvironmentTypeDefinition
): CSVError[] => {
  // Normalize the environment type definition and validate the cell
  const result = validateQuantitativeValue(
    params.cell,
    {
      min: environment.min,
      max: environment.max
    },
    'environment'
  );

  // If the result is not a quantitative value it is a list of CSV errors
  if (typeof result !== 'number') {
    return result;
  }

  // Update the row state with the taxon environment id and value
  updateCSVRowState(params.row, {
    [params.header]: {
      environment_quantitative_id: environment.environment_quantitative_id,
      value: result
    } satisfies Pick<ObservationSubCountQuantitativeEnvironmentRecord, 'environment_quantitative_id' | 'value'>
  });

  return [];
};
