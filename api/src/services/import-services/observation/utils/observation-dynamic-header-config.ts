import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';

export const isMeasurementHeader = (header: string) => {
  return true;
};

export const isEnvironmentHeader = (header: string) => {
  return true;
};

export const getObservationDynamicHeaderConfig = (): CSVCellValidator => {
  return (params) => {
    if (isMeasurementHeader(params.header)) {
      return [];
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
