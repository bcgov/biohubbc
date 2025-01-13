import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import { updateCSVRowState } from '../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../utils/nested-record';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  ICritterDetailed
} from '../../critterbase-service';
import {
  isCBQualitativeMeasurementTypeDefinition,
  isCBQuantitativeMeasurementTypeDefinition
} from '../utils/measurement';
import { MeasurementCSVStaticHeader } from './import-measurements-service';

export type TSNMeasurementDictionary = NestedRecord<
  CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
>;

/**
 * Get the dynamic measurement cell validator.
 *
 * @param {TSNMeasurementDictionary} tsnMeasurementDictionary The TSN measurement dictionary
 * @param {Map<string, ICritterDetailed>} surveyAliasMap The survey alias map
 * @param {CSVConfigUtils<MeasurementCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDynamicMeasurementCellValidator = (
  tsnMeasurementDictionary: TSNMeasurementDictionary,
  surveyAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils<MeasurementCSVStaticHeader>
): CSVCellValidator => {
  return (params) => {
    if (params.cell === undefined) {
      return [];
    }

    const alias = String(utils.getCellValue('ALIAS', params.row)).toLowerCase();
    const critter = surveyAliasMap.get(alias);
    const critterTsn = Number(critter?.itis_tsn);

    const taxonMeasurements = tsnMeasurementDictionary.get(critterTsn);

    if (!taxonMeasurements) {
      return [
        {
          error: `No measurements exist for this taxon TSN: ${critterTsn}`,
          solution: 'Make sure the taxon has reference measurements'
        }
      ];
    }

    const headerMeasurement = tsnMeasurementDictionary.get(critterTsn, params.header);

    if (!headerMeasurement) {
      return [
        {
          error: `Measurement ${params.header} does not exist for this taxon`,
          solution: 'Use a valid measurement for this taxon',
          values: Object.keys(taxonMeasurements)
        }
      ];
    }

    if (isCBQualitativeMeasurementTypeDefinition(headerMeasurement)) {
      const qualitativeCellValidator = getQualitativeMeasurementCellValidator(headerMeasurement);

      return qualitativeCellValidator(params);
    }

    if (isCBQuantitativeMeasurementTypeDefinition(headerMeasurement)) {
      const quantitativeCellValidator = getQuantitativeMeasurementCellValidator(headerMeasurement);

      return quantitativeCellValidator(params);
    }

    return [
      {
        error: 'Invalid measurement type',
        solution: 'Use a valid measurement type'
      }
    ];
  };
};

/**
 * Get the quantitative measurement cell validator.
 *
 * @param {CBQuantitativeMeasurementTypeDefinition} measurement The quantitative measurement definition
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
const getQuantitativeMeasurementCellValidator = (
  measurement: CBQuantitativeMeasurementTypeDefinition
): CSVCellValidator => {
  return (params) => {
    const cellErrors: CSVError[] = [];

    // Qualitative measurements are numbers ie: antler count: 2
    if (typeof params.cell !== 'number') {
      return [
        {
          error: 'Quantitative measurement must be a number',
          solution: 'Update the cell value to match the expected type'
        }
      ];
    }

    // Validate cell value is withing the measurement min max bounds
    if (measurement.max_value != null && params.cell > measurement.max_value) {
      cellErrors.push({
        error: 'Quantitative measurement too large',
        solution: `Value must be less than or equal to ${measurement.max_value}`
      });
    }

    // Validate cell value is withing the measurement min max bounds
    if (measurement.min_value != null && params.cell < measurement.min_value) {
      cellErrors.push({
        error: 'Quantitative measurement too small',
        solution: `Value must be greater than or equal to ${measurement.min_value}`
      });
    }

    // Update the row state with the taxon measurement id and value
    // Why an object? Because we need to store the measurement id and the value, and multiple
    // measurements can be stored in the same row (which would override if not using the header as a key).
    updateCSVRowState(params.row, {
      [params.header]: {
        taxon_measurement_id: measurement.taxon_measurement_id,
        value: params.cell
      }
    });

    return cellErrors;
  };
};

/**
 * Get the qualitative measurement cell validator.
 *
 * Note: This function will mutate the cell value to the qualitative option id
 *
 * @param {CBQualitativeMeasurementTypeDefinition} measurement The qualitative measurement definition
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
const getQualitativeMeasurementCellValidator = (
  measurement: CBQualitativeMeasurementTypeDefinition
): CSVCellValidator => {
  return (params) => {
    if (typeof params.cell !== 'string') {
      return [
        {
          error: 'Qualitative measurement must be a string',
          solution: 'Update the cell value to match the expected type'
        }
      ];
    }

    const matchingOptionValue = measurement.options.find(
      // Not sure why I need to cast params.cell to string here after checking above...
      (option) => option.option_label.toLowerCase() === String(params.cell).toLowerCase()
    );

    // Validate cell value is an alowed qualitative measurement option
    if (!matchingOptionValue) {
      return [
        {
          error: `Invalid qualitative measurement option`,
          solution: `Use a valid qualitative measurement option`,
          values: measurement.options.map((option) => option.option_label)
        }
      ];
    }

    // Update the row state with the taxon measurement id and qualitative option id
    // Why an object? Because we need to store the measurement id and the value, and multiple
    // measurements can be stored in the same row (which would override if not using the header as a key).
    updateCSVRowState(params.row, {
      [params.header]: {
        taxon_measurement_id: measurement.taxon_measurement_id,
        qualitative_measurement_id: matchingOptionValue.qualitative_option_id
      }
    });

    return [];
  };
};
