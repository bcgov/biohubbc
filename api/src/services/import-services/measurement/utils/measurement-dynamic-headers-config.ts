import { CSVCellValidator, CSVError, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { updateCSVRowState } from '../../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../../utils/nested-record';
import {
  CBQualitativeMeasurement,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../../../critterbase-service';
import {
  isCBQualitativeMeasurementTypeDefinition,
  isCBQuantitativeMeasurementTypeDefinition
} from '../../utils/measurement';
import { validateQualitativeCellValue } from '../../utils/qualitative';
import { validateQuantitativeCellValue } from '../../utils/quantitative';

export type TSNMeasurementDictionary = NestedRecord<
  CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
>;

/**
 * Get the dynamic measurement cell validator.
 *
 * @param {TSNMeasurementDictionary} tsnMeasurementDictionary The TSN measurement dictionary
 * @param {(params: CSVParams) => number} getRowTSN The callback to get the TSN from the row/params
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDynamicMeasurementCellValidator = (
  tsnMeasurementDictionary: TSNMeasurementDictionary,
  getRowTSN: (params: CSVParams) => number
): CSVCellValidator => {
  return (params) => {
    if (params.cell === undefined) {
      return [];
    }

    const tsn = getRowTSN(params);

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

    return _validateMeasurement(params, measurement);
  };
};

export const _validateMeasurement = (params: CSVParams, measurement: unknown): CSVError[] => {
  if (isCBQualitativeMeasurementTypeDefinition(measurement)) {
    const result = validateQualitativeCellValue(params.cell, {
      qualitative_id: measurement.taxon_measurement_id,
      options: measurement.options.map((option) => ({
        option_id: option.qualitative_option_id,
        option_name: option.option_label
      }))
    });

    if (Array.isArray(result)) {
      return result;
    }

    // Update the row state with the taxon environment id and qualitative option id
    updateCSVRowState(params.row, {
      [params.header]: {
        taxon_measurement_id: result.qualitative_id,
        qualitative_option_id: result.option_id
      } satisfies Partial<CBQualitativeMeasurement>
    });

    return [];
  }

  if (isCBQuantitativeMeasurementTypeDefinition(measurement)) {
    const result = validateQuantitativeCellValue(params.cell, {
      quantitative_id: measurement.taxon_measurement_id,
      min: measurement.min_value,
      max: measurement.max_value
    });

    if (Array.isArray(result)) {
      return result;
    }

    return [];
  }

  // Can this path ever be reached?
  return [
    {
      error: 'Invalid measurement type',
      solution: 'Use a supported measurement type'
    }
  ];
};
