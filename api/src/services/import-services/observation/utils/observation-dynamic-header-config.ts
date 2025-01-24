import { CSVCellValidator, CSVParams } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getDynamicMeasurementCellValidator } from '../../measurement/utils/measurement-header-configs';
import { TSNMeasurementDictionary } from '../../utils/measurement';
import { isEnvironmentHeader, isMeasurementHeader } from './obseration-utils';

export const getObservationDynamicHeaderConfig = (
  tsnMeasurementDictionary: TSNMeasurementDictionary,
  getRowTSN: (params: CSVParams) => number
): CSVCellValidator => {
  return (params) => {
    if (isMeasurementHeader(params.header, tsnMeasurementDictionary)) {
      return getDynamicMeasurementCellValidator(tsnMeasurementDictionary, getRowTSN)(params);
    }

    if (isEnvironmentHeader(params.header)) {
      return [];
    }

    return [
      {
        error: `Invalid dynamic header`,
        solution: `Expecting measurement or environment header`
      }
    ];
  };
};
