import { ApiGeneralError } from '../../errors/api-error';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../../services/critterbase-service';
import { isQualitativeValueValid, isQuantitativeValueValid } from './common-utils';

export type TsnMeasurementTypeDefinitionMap = Record<
  string,
  { qualitative: CBQualitativeMeasurementTypeDefinition[]; quantitative: CBQuantitativeMeasurementTypeDefinition[] }
>;

export interface IMeasurementDataToValidate {
  tsn: string;
  key: string;
  value: string | number;
}

/**
 * Fetches measurement definitions from critterbase for a given list of TSNs and creates and returns a map with all data fetched
 * Throws if a TSN does not return measurements.
 *
 * @param {string[]} tsns List of TSNs
 * @param {CritterbaseService} critterBaseService Critterbase service
 * @returns {*} Promise<TsnMeasurementTypeDefinitionMap>
 */
export async function getCBMeasurementsFromTSN(
  tsns: string[],
  critterBaseService: CritterbaseService
): Promise<TsnMeasurementTypeDefinitionMap> {
  const tsnMeasurements: TsnMeasurementTypeDefinitionMap = {};

  for (const tsn of tsns) {
    if (tsnMeasurements[tsn]) {
      // Already fetched measurements for this TSN
      continue;
    }

    const measurements = await critterBaseService.getTaxonMeasurements(tsn).catch((error) => {
      throw new ApiGeneralError('Error connecting to the Critterbase API', [error as Error]);
    });

    if (!measurements) {
      throw new ApiGeneralError(`No measurements found for tsn: ${tsn}`);
    }

    tsnMeasurements[tsn] = measurements;
  }

  return tsnMeasurements;
}

/**
 * Get measurement definition from the provided tsn measurement map, based on the provided TSN and
 * measurement column name.
 *
 * @export
 * @param {string} tsn An ITIS TSN number.
 * @param {string} measurementColumnName
 * @param {TsnMeasurementTypeDefinitionMap} tsnMeasurementTypeDefinitionMap
 * @return {*}  {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition | null | undefined)}
 */
export function getMeasurementFromTsnMeasurementTypeDefinitionMap(
  tsn: string,
  measurementColumnName: string,
  tsnMeasurementTypeDefinitionMap: TsnMeasurementTypeDefinitionMap
): CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition | null | undefined {
  const measurements = tsnMeasurementTypeDefinitionMap[tsn];

  if (!measurements) {
    // No measurements for TSN
    return null;
  }

  if (measurements.qualitative.length > 0) {
    const qualitativeMeasurement = measurements.qualitative.find(
      (measurement) => measurement.measurement_name.toLowerCase() === measurementColumnName.toLowerCase()
    );

    if (qualitativeMeasurement) {
      // Found qualitative measurement by column/ measurement name
      return qualitativeMeasurement;
    }
  }

  if (measurements.quantitative.length > 0) {
    const quantitativeMeasurement = measurements.quantitative.find(
      (measurement) => measurement.measurement_name.toLowerCase() === measurementColumnName.toLowerCase()
    );

    if (quantitativeMeasurement) {
      // Found quantitative measurement by column/ measurement name
      return quantitativeMeasurement;
    }
  }

  // No measurements found for TSN
  return null;
}

/**
 * Type guard to check if a given item is a `CBQualitativeMeasurementTypeDefinition`.
 *
 * Qualitative measurements have an `options` property, while quantitative measurements do not.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is CBQualitativeMeasurementTypeDefinition}
 */
export function isMeasurementCBQualitativeTypeDefinition(
  item: CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition
): item is CBQualitativeMeasurementTypeDefinition {
  return 'options' in item;
}

/**
 * Given an array of column headers, returns an array of column headers that have a corresponding measurement type
 * definition in the provided TsnMeasurementTypeDefinitionMap.
 *
 * @export
 * @param {string[]} columns
 * @param {TsnMeasurementTypeDefinitionMap} tsnMeasurements
 * @return {*}  {string[]}
 */
export function getMeasurementColumnNames(
  columns: string[],
  tsnMeasurements: TsnMeasurementTypeDefinitionMap
): string[] {
  const allQualitativeMeasurementTypeDefinitions = Object.values(tsnMeasurements).flatMap((tsn) => tsn.qualitative);
  const allQuantitativeMeasurementTypeDefinitions = Object.values(tsnMeasurements).flatMap((tsn) => tsn.quantitative);

  // Filter out columns that have no corresponding measurement type definition
  return columns.filter((column) => {
    const columnLowerCase = column.toLowerCase();

    return (
      allQualitativeMeasurementTypeDefinitions.some(
        (measurement) => measurement.measurement_name.toLowerCase() === columnLowerCase
      ) ||
      allQuantitativeMeasurementTypeDefinitions.some(
        (measurement) => measurement.measurement_name.toLowerCase() === columnLowerCase
      )
    );
  });
}

/**
 * Checks if all passed in measurement data is valid.
 * Returns false at first invalid measurement.
 *
 * @export
 * @param {IMeasurementDataToValidate[]} data The measurement data to validate
 * @param {TsnMeasurementTypeDefinitionMap} tsnMeasurementMap An object map of measurement definitions from Critterbase organized by TSN numbers
 * @returns {*} boolean Results of validation
 */
export function validateMeasurements(
  measurementsToValidate: IMeasurementDataToValidate[],
  tsnMeasurementMap: TsnMeasurementTypeDefinitionMap
): boolean {
  return measurementsToValidate.every((measurementToValidate) => {
    if (!measurementToValidate.value) {
      // An empty value is valid
      return true;
    }

    const measurementsForTsn = tsnMeasurementMap[measurementToValidate.tsn];

    if (!measurementsForTsn) {
      // No measurement was found for the TSN for this measurement. The incoming data is invalid.
      return false;
    }

    // Attempt to find the qualitative measurement that matches the column name, if any
    const matchingQualitativeMeasurement = measurementsForTsn.qualitative.find((measurementForTsn) =>
      // Compare the column name to the measurement name and the taxon_measurement_id
      [measurementForTsn.taxon_measurement_id.toLowerCase(), measurementForTsn.measurement_name.toLowerCase()].includes(
        measurementToValidate.key.toLowerCase()
      )
    );

    // Attempt to find the quantitative measurement that matches the column name, if any
    const matchingQuantitativeMeasurement = measurementsForTsn.quantitative.find((measurementForTsn) =>
      // Compare the column name to the measurement name and the taxon_measurement_id
      [measurementForTsn.taxon_measurement_id.toLowerCase(), measurementForTsn.measurement_name.toLowerCase()].includes(
        measurementToValidate.key.toLowerCase()
      )
    );

    if (matchingQualitativeMeasurement && matchingQuantitativeMeasurement) {
      // Column name matches both qualitative and quantitative measurements. The Critterbase measurement
      // reference data is invalid.
      return false;
    }

    if (matchingQualitativeMeasurement) {
      return isQualitativeValueValid(
        String(measurementToValidate.value).toLowerCase(),
        // Flatten the options array to include the option id, value, and label
        matchingQualitativeMeasurement.options.flatMap((option) => [
          String(option.qualitative_option_id),
          String(option.option_value),
          option.option_label.toLowerCase()
        ])
      );
    }

    if (matchingQuantitativeMeasurement) {
      return isQuantitativeValueValid(
        Number(measurementToValidate.value),
        matchingQuantitativeMeasurement.min_value,
        matchingQuantitativeMeasurement.max_value
      );
    }

    // Column name does not match any measurements for the TSN. The incoming data is invalid.
    return false;
  });
}
