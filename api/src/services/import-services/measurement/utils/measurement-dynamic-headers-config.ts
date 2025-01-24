import { CSVCellValidator, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { NestedRecord } from '../../../../utils/nested-record';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../../../critterbase-service';
import {
  isCBQualitativeMeasurementTypeDefinition,
  isCBQuantitativeMeasurementTypeDefinition
} from '../../utils/measurement';
import {
  getQualitativeMeasurementCellValidator,
  getQuantitativeMeasurementCellValidator
} from './measurement-header-configs';

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
