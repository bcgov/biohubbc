import {
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../../../repositories/observation-subcount-environment-repository';
import { CSVCellValidator, CSVError } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { updateCSVRowState } from '../../../../utils/csv-utils/csv-header-configs';

/**
 * Get the quantitative environment cell validator.
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getQuantitativeEnvironmentCellValidator = (
  environment: QuantitativeEnvironmentTypeDefinition
): CSVCellValidator => {
  return (params) => {
    const cellErrors: CSVError[] = [];

    // Quantitative environments are numbers ie: antler count: 2
    if (typeof params.cell !== 'number') {
      return [
        {
          error: 'Quantitative environment must be a number',
          solution: 'Update the cell value to match the expected type'
        }
      ];
    }

    // Validate cell value is withing the environment min max bounds
    if (environment.max != null && params.cell > environment.max) {
      cellErrors.push({
        error: 'Quantitative environment too large',
        solution: `Value must be less than or equal to ${environment.max}`
      });
    }

    // Validate cell value is withing the environment min max bounds
    if (environment.min != null && params.cell < environment.min) {
      cellErrors.push({
        error: 'Quantitative environment too small',
        solution: `Value must be greater than or equal to ${environment.min}`
      });
    }

    // Update the row state with the taxon environment id and value
    updateCSVRowState(params.row, {
      // Using header to prevent overwriting other environments
      // ie: This function will be called once for each dynamic header
      [params.header]: {
        environment_quantitative_id: environment.environment_quantitative_id,
        value: params.cell
      } satisfies Partial<any> // TODO: update type
    });

    return cellErrors;
  };
};

/**
 * Get the qualitative environment cell validator.
 *
 * Note: This function will mutate the cell value to the qualitative option id
 *
 * @param {CBQualitativeMeasurementTypeDefinition} environment The qualitative environment definition
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getQualitativeEnvironmentCellValidator = (
  environment: QualitativeEnvironmentTypeDefinition
): CSVCellValidator => {
  return (params) => {
    if (typeof params.cell !== 'string') {
      return [
        {
          error: 'Qualitative environment must be a string',
          solution: 'Update the cell value to match the expected type'
        }
      ];
    }

    const matchingOptionValue = environment.options.find(
      // Not sure why I need to cast params.cell to string here after checking above...
      (option) => option.name.toLowerCase() === String(params.cell).toLowerCase()
    );

    // Validate cell value is an alowed qualitative environment option
    if (!matchingOptionValue) {
      return [
        {
          error: `Invalid qualitative environment option`,
          solution: `Use a valid qualitative environment option`,
          values: environment.options.map((option) => option.name)
        }
      ];
    }

    // Update the row state with the taxon environment id and qualitative option id
    updateCSVRowState(params.row, {
      // Using header to prevent overwriting other measurements
      // ie: This function will be called once for each dynamic header
      [params.header]: {
        environment_qualitative_id: environment.environment_qualitative_id,
        environment_qualitative_option_id: matchingOptionValue.environment_qualitative_option_id
      } satisfies Partial<any> // TODO: update type
    });

    return [];
  };
};
