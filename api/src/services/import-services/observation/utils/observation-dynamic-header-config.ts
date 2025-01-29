import { CSVCellValidator, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getDynamicMeasurementCellValidator } from '../../measurement/utils/measurement-dynamic-header-config';
import { EnvironmentNameTypeDefinitionMap } from '../../utils/environment';
import { TSNMeasurementDictionary } from '../../utils/measurement';
import { getDynamicEnvironmentCellValidator } from './environment-dynamic-header-config';

export const getObservationDynamicHeaderConfig = (
  tsnMeasurementDictionary: TSNMeasurementDictionary,
  environmentDictionary: EnvironmentNameTypeDefinitionMap,
  getCritterTsn: (params: CSVParams) => number
): CSVCellValidator => {
  // Note: This validator makes the assumption that a measurement header
  // and an environment header will never have the same name
  return (params) => {
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
        solution: `Expecting measurement or environment header`
      }
    ];
  };
};
