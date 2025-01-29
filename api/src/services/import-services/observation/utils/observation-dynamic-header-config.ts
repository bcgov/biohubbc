import { CSVCellValidator, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getDynamicMeasurementCellValidator } from '../../measurement/utils/measurement-dynamic-header-config';
import { EnvironmentNameTypeDefinitionMap } from '../../utils/environment';
import { TSNMeasurementDictionary } from '../../utils/measurement';
import { getDynamicEnvironmentCellValidator } from './environment-dynamic-header-config';

/**
 * Get the observation dynamic header config.
 *
 * @param {TSNMeasurementDictionary} tsnMeasurementDictionary The TSN measurement dictionary
 * @param {EnvironmentNameTypeDefinitionMap} environmentDictionary The environment dictionary
 * @param {(params: CSVParams) => number} getCritterTsn The callback to get the TSN from the row/params
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getObservationDynamicHeaderCellValidator = (
  tsnMeasurementDictionary: TSNMeasurementDictionary,
  environmentDictionary: EnvironmentNameTypeDefinitionMap,
  getCritterTsn: (params: CSVParams) => number
): CSVCellValidator => {
  return (params) => {
    if (tsnMeasurementDictionary.has(params.header) && environmentDictionary.has(params.header)) {
      return [
        {
          error: `Dynamic header conflict`,
          solution: `Header '${params.header}' is both a measurement and an environment`,
          cell: null
        }
      ];
    }

    // Check if the header is a measurement header
    if (tsnMeasurementDictionary.has(params.header)) {
      return getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getCritterTsn)(params);
    }

    // Check if the header is an environment header
    if (environmentDictionary.has(params.header)) {
      return getDynamicEnvironmentCellValidator(environmentDictionary)(params);
    }

    // Question: Should we return an error if the header is neither a measurement nor environment header?
    return [
      {
        error: `Invalid dynamic header`,
        solution: `Expecting measurement or environment header`,
        cell: null
      }
    ];
  };
};
