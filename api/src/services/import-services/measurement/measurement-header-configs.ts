import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator, CSVError } from '../../../utils/csv-utils/csv-config-validation.interface';
import { updateCSVRowState } from '../../../utils/csv-utils/csv-header-configs';
import { NestedRecord } from '../../../utils/nested-record';
import {
  CBQualitativeMeasurement,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurement,
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
          error: `Taxon has no reference measurements`,
          solution: 'Make sure the taxon has reference measurements'
        }
      ];
    }

    const measurement = tsnMeasurementDictionary.get(critterTsn, params.header);

    if (!measurement) {
      return [
        {
          error: `Column header '${params.header}' does not exist`,
          solution: 'Use a valid taxon measurement as the header',
          values: Object.keys(taxonMeasurements)
        }
      ];
    }

    // Validate the cell based on the measurement type from the header
    if (isCBQualitativeMeasurementTypeDefinition(measurement)) {
      return getQualitativeMeasurementCellValidator(measurement)(params);
    }

    if (isCBQuantitativeMeasurementTypeDefinition(measurement)) {
      return getQuantitativeMeasurementCellValidator(measurement)(params);
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
 * Get the quantitative measurement cell validator.
 *
 * @param {CBQuantitativeMeasurementTypeDefinition} measurement The quantitative measurement definition
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getQuantitativeMeasurementCellValidator = (
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
    updateCSVRowState(params.row, {
      // Using header to prevent overwriting other measurements
      // ie: This function will be called once for each dynamic header
      [params.header]: {
        taxon_measurement_id: measurement.taxon_measurement_id,
        value: params.cell
      } satisfies Partial<CBQuantitativeMeasurement>
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
export const getQualitativeMeasurementCellValidator = (
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
    updateCSVRowState(params.row, {
      // Using header to prevent overwriting other measurements
      // ie: This function will be called once for each dynamic header
      [params.header]: {
        taxon_measurement_id: measurement.taxon_measurement_id,
        qualitative_option_id: matchingOptionValue.qualitative_option_id
      } satisfies Partial<CBQualitativeMeasurement>
    });

    return [];
  };
};
