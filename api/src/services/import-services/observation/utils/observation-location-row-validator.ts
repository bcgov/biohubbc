import { CSVConfigUtils } from '../../../../utils/csv-utils/csv-config-utils';
import { CSVRowError, CSVRowValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { getSamplePeriodIdFromRowState } from '../../utils/row-state';
import { ObservationCSVStaticHeader } from '../import-observations-service';

/**
 * Get the observation location row validator
 *
 * Note: This validator must run after the `Sampling Information Row Validator`
 *
 * @see observation-sampling-information-row-validator.ts
 *
 * Rules:
 *  1. Latitude is required when sampling information is not provided
 *  2. Longitude is required when sampling information is not provided
 *
 * @param {CSVConfigUtils<ObservationCSVStaticHeader>} utils - The CSV config utils
 * @returns {*} {CSVRowValidator}
 */
export function getObservationLocationRowValidator(utils: CSVConfigUtils<ObservationCSVStaticHeader>): CSVRowValidator {
  return (params) => {
    const stateSamplePeriodId = getSamplePeriodIdFromRowState(params.row).sample_period_id;

    const worksheetLatitude = utils.getCellValue('LATITUDE', params.row);
    const worksheetLongitude = utils.getCellValue('LONGITUDE', params.row);

    if (stateSamplePeriodId || (worksheetLatitude && worksheetLongitude)) {
      return [];
    }

    const errors: CSVRowError[] = [];

    if (!worksheetLatitude) {
      errors.push({
        error: 'Latitude is required when sampling information is not provided',
        solution: 'Please include a latitude for the observation',
        header: 'LATITUDE' satisfies ObservationCSVStaticHeader,
        cell: null
      });
    }

    if (!worksheetLongitude) {
      errors.push({
        error: 'Longitude is required when sampling information is not provided',
        solution: 'Please include a longitude for the observation',
        header: 'LONGITUDE' satisfies ObservationCSVStaticHeader,
        cell: null
      });
    }

    return errors;
  };
}
