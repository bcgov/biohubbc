import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getDynamicMeasurementCellValidator } from '../../measurement/utils/measurement-dynamic-headers-config';
import { EnvironmentNameTypeDefinitionMap } from '../../utils/environment';
import { TSNMeasurementDictionary } from '../../utils/measurement';
import { getTaxonFromRowState } from '../../utils/row-state';
import { getDynamicEnvironmentCellValidator } from './environment-dynamic-headers-config';

/**
 * Get the observation dynamic header config.
 *
 * Rules:
 *  1. The header must be a valid Critterbase measurement or SIMS environment
 *
 * @param {TSNMeasurementDictionary} tsnMeasurementDictionary The TSN measurement dictionary
 * @param {EnvironmentNameTypeDefinitionMap} environmentDictionary The environment dictionary
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getObservationDynamicHeaderCellValidator = (
  tsnMeasurementDictionary: TSNMeasurementDictionary,
  environmentDictionary: EnvironmentNameTypeDefinitionMap
): CSVCellValidator => {
  return (params) => {
    const critterTsn = getTaxonFromRowState(params.row).itis_tsn;

    // Check that the header is not a measurement AND an environment
    if (tsnMeasurementDictionary.has(critterTsn, params.header) && environmentDictionary.has(params.header)) {
      // Note: This is an edge case that should not happen
      return [
        {
          error: `Dynamic header conflict`,
          solution: `Column header '${params.header}' is both a measurement and an environment`,
          cell: null // The cell value is not relevant
        }
      ];
    }

    // Check if the header is a measurement header and validate the cell
    if (tsnMeasurementDictionary.has(critterTsn, params.header)) {
      return getDynamicMeasurementCellValidator(tsnMeasurementDictionary, () => critterTsn)(params);
    }

    // Check if the header is an environment header and validate the cell
    if (environmentDictionary.has(params.header)) {
      return getDynamicEnvironmentCellValidator(environmentDictionary)(params);
    }

    return [
      {
        error: `Invalid dynamic header`,
        solution: `Expecting measurement or environment column header`,
        cell: null // The cell value is not relevant
      }
    ];
  };
};
