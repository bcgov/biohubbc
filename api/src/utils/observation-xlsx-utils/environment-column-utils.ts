import {
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../repositories/observation-subcount-environment-repository';
import { getLogger } from '../logger';

const defaultLog = getLogger('src/utils/observation-xlsx-utils/environment-column-utils');

/**
 * Given an array of column headers, returns an array of column headers that have a corresponding environment type
 * definitions.
 *
 * @export
 * @param {string[]} columns
 * @param {{
 *     qualitative_environments: QualitativeEnvironmentTypeDefinition[];
 *     quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
 *   }} environments
 * @return {*}
 */
export function getEnvironmentColumnNames(
  columns: string[],
  environments: {
    qualitative_environments: QualitativeEnvironmentTypeDefinition[];
    quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
  }
) {
  // Filter out columns that have no corresponding environment type definition
  return columns.filter((column) => {
    return (
      environments.qualitative_environments.some((item) => String(item.environment_qualitative_id) === column) ||
      environments.quantitative_environments.some((item) => String(item.environment_quantitative_id) === column)
    );
  });
}

export function validateCsvEnvironmentColumns(rows: Record<string, any>[], environmentColumns: string[]): boolean {
  return validateMeasurements(mappedData, tsnMeasurementMap);
}

/**
 * Checks if all passed in measurement data is valid or returns false at first invalid measurement.
 *
 * @param {IMeasurementDataToValidate[]} data The measurement data to validate
 * @param {TsnMeasurementMap} tsnMeasurementMap An object map of measurement definitions from Critterbase organized by TSN numbers
 * @returns {*} boolean Results of validation
 */
export function validateCsvEnvironmentColumns(
  data: IMeasurementDataToValidate[],
  tsnMeasurementMap: TsnMeasurementMap
): boolean {
  return data.every((item) => {
    const measurements = tsnMeasurementMap[item.tsn];
    if (!measurements) {
      defaultLog.debug({ label: 'validateMeasurements', message: 'Invalid: No measurements' });
      return false;
    }

    // only validate if the column has data
    if (!item.measurement_value) {
      return true;
    }

    // find the correct measurement
    if (measurements.qualitative.length > 0) {
      const measurement = measurements.qualitative.find(
        (measurement) =>
          measurement.measurement_name.toLowerCase() === item.measurement_key.toLowerCase() ||
          measurement.taxon_measurement_id === item.measurement_key
      );
      if (measurement) {
        return isQualitativeValueValid(item.measurement_value, measurement);
      }
    }

    if (measurements.quantitative.length > 0) {
      const measurement = measurements.quantitative.find(
        (measurement) =>
          measurement.measurement_name.toLowerCase() === item.measurement_key.toLowerCase() ||
          measurement.taxon_measurement_id === item.measurement_key
      );
      if (measurement) {
        return isQuantitativeValueValid(Number(item.measurement_value), measurement);
      }
    }

    // Has measurements for tsn
    // Has data but no matches found, entry is invalid
    defaultLog.debug({ label: 'validateMeasurements', message: 'Invalid', item });
    return false;
  });
}

/**
 * Type guard to check if a given item is a `QualitativeEnvironmentTypeDefinition`.
 *
 * Qualitative environments have an `options` property, while quantitative environments do not.
 *
 * @export
 * @param {(QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition)} item
 * @return {*}  {item is QualitativeEnvironmentTypeDefinition}
 */
export function isEnvironmentQualitativeTypeDefinition(
  item: QualitativeEnvironmentTypeDefinition | QuantitativeEnvironmentTypeDefinition
): item is QualitativeEnvironmentTypeDefinition {
  return 'options' in item;
}
