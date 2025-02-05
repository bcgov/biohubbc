import { CSVCellValidator, CSVError, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { updateCSVRowState } from '../../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../../utils/nested-record';
import {
  CBQualitativeMeasurement,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurement,
  CBQuantitativeMeasurementTypeDefinition
} from '../../../critterbase-service';
import {
  isCBQualitativeMeasurementTypeDefinition,
  isCBQuantitativeMeasurementTypeDefinition
} from '../../utils/measurement';
import { validateQualitativeValue } from '../../utils/qualitative';
import { validateQuantitativeValue } from '../../utils/quantitative';

export type TSNMeasurementDictionary = NestedRecord<
  CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
>;

/**
 * Get the dynamic measurement cell validator.
 *
 * @param {TSNMeasurementDictionary} tsnMeasurementDictionary The TSN measurement dictionary
 * @param {(params: CSVParams) => number} getCritterTsn The callback to get the TSN from the row/params
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDynamicMeasurementCellValidator = (
  tsnMeasurementDictionary: TSNMeasurementDictionary,
  getCritterTsn: (params: CSVParams) => number
): CSVCellValidator => {
  return (params) => {
    if (params.cell === undefined) {
      return [];
    }

    const tsn = getCritterTsn(params);

    const taxonMeasurements = tsnMeasurementDictionary.get(tsn);

    if (!taxonMeasurements) {
      return [
        {
          error: `Taxon has no reference measurements`,
          solution: 'Make sure the taxon has reference measurements'
        }
      ];
    }

    const measurement = tsnMeasurementDictionary.get(tsn, params.header);

    if (!measurement) {
      return [
        {
          error: `Column header '${params.header}' does not exist`,
          solution: 'Use a valid taxon measurement as the header',
          values: Object.keys(taxonMeasurements)
        }
      ];
    }

    if (isCBQualitativeMeasurementTypeDefinition(measurement)) {
      return validateQualitativeMeasurementCell(params, measurement);
    }

    if (isCBQuantitativeMeasurementTypeDefinition(measurement)) {
      return validateQuantitativeMeasurementCell(params, measurement);
    }

    // Can this path ever be reached?
    return [
      {
        error: 'Invalid measurement type',
        solution: 'Use a supported measurement type'
      }
    ];
  };
};

/**
 * Validate the qualitative measurement cell value.
 *
 * @param {CSVParams} params The CSV params
 * @param {CBQualitativeMeasurementTypeDefinition} measurement The qualitative measurement definition
 * @returns {CSVError[]} The list of errors
 */
export const validateQualitativeMeasurementCell = (
  params: CSVParams,
  measurement: CBQualitativeMeasurementTypeDefinition
): CSVError[] => {
  const options = measurement.options.map((option) => ({
    option_id: option.qualitative_option_id,
    option_name: option.option_label
  }));

  // Normalize the measurement type definition and validate
  const result = validateQualitativeValue(params.cell, { options: options }, 'measurement');

  // If the result is list of CSV errors
  if (typeof result !== 'string') {
    return result;
  }

  // Update the row state with the taxon measurement id and qualitative option id
  updateCSVRowState(params.row, {
    [params.header]: {
      taxon_measurement_id: measurement.taxon_measurement_id,
      qualitative_option_id: result
    } satisfies Partial<CBQualitativeMeasurement>
  });

  return [];
};

/**
 * Validate the quantitative measurement cell value.
 *
 * @param {CSVParams} params The CSV params
 * @param {CBQuantitativeMeasurementTypeDefinition} measurement The quantitative measurement definition
 * @returns {CSVError[]} The list of errors
 */
export const validateQuantitativeMeasurementCell = (
  params: CSVParams,
  measurement: CBQuantitativeMeasurementTypeDefinition
): CSVError[] => {
  // Normalize the measurement type definition and validate
  const result = validateQuantitativeValue(
    params.cell,
    {
      min: measurement.min_value,
      max: measurement.max_value
    },
    'measurement'
  );

  // If the result is list of CSV errors
  if (typeof result !== 'number') {
    return result;
  }

  // Update the row state with the taxon measurement id and value
  updateCSVRowState(params.row, {
    [params.header]: {
      taxon_measurement_id: measurement.taxon_measurement_id,
      value: result
    } satisfies Partial<CBQuantitativeMeasurement>
  });

  return [];
};
