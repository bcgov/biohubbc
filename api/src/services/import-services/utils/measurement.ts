import { NestedRecord } from '../../../utils/nested-record';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../../critterbase-service';

export type TSNMeasurementDictionary = NestedRecord<
  CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
>;

/**
 * Check if an object is a `CBQuantitativeMeasurementTypeDefinition`
 *
 * Returns true if the object has the properties `unit` and `taxon_measurement_id`
 *
 * @param {any} measurement - The object to check
 * @returns {boolean} True if the object is a CBQuantitativeMeasurementTypeDefinition
 */
export const isCBQuantitativeMeasurementTypeDefinition = (
  measurement: unknown
): measurement is CBQuantitativeMeasurementTypeDefinition => {
  return (
    typeof measurement === 'object' &&
    measurement != null &&
    'unit' in measurement &&
    'taxon_measurement_id' in measurement
  );
};

/**
 * Check if an object is a `CBQualitativeMeasurementTypeDefinition`
 *
 * Returns true if the object has the properties `options` and `taxon_measurement_id`
 *
 * @param {unknown} measurement - The object to check
 * @returns {boolean} True if the object is a CBQualitativeMeasurementTypeDefinition
 */
export const isCBQualitativeMeasurementTypeDefinition = (
  measurement: unknown
): measurement is CBQualitativeMeasurementTypeDefinition => {
  return (
    typeof measurement === 'object' &&
    measurement != null &&
    'options' in measurement &&
    'taxon_measurement_id' in measurement
  );
};

/**
 * Check if an object is a qualitative measurement stub
 *
 * Returns true if the object has the properties `qualitative_option_id` and `taxon_measurement_id`
 *
 * Note: This function is NOT a typeguard, it is used to determine if an object
 * contains the minimum required properties to create a qualitative measurement.
 *
 * @param {unknown} measurement - The object to check
 * @returns {boolean} True if the object is a qualitative measurement
 */
export const isCBQualitativeMeasurementStub = (measurement: unknown): boolean => {
  return (
    typeof measurement === 'object' &&
    measurement != null &&
    'qualitative_option_id' in measurement &&
    'taxon_measurement_id' in measurement
  );
};

/**
 * Check if an object is a quantitative measurement stub
 *
 * Returns true if the object has the properties `value` and `taxon_measurement_id`
 *
 * Note: This function is NOT a typeguard, it is used to determine if an object
 * contains the minimum required properties to create a quantitative measurement.
 *
 * @param {unknown} measurement - The object to check
 * @returns {boolean} True if the object is a quantitative measurement
 */
export const isCBQuantitativeMeasurementStub = (measurement: unknown): boolean => {
  return (
    typeof measurement === 'object' &&
    measurement != null &&
    'value' in measurement &&
    'taxon_measurement_id' in measurement
  );
};

/**
 * Get the TSN measurement type definition dictionary.
 *
 * @async
 * @param {number[]} tsns - List of ITIS TSN's
 * @param {CritterbaseService} critterbaseService
 * @returns {*} {Promise<TSNMeasurementDictionary>} Measurement dictionary
 */
const getTsnMeasurementDictionaryCore = async (
  tsns: number[],
  critterbaseService: CritterbaseService
): Promise<TSNMeasurementDictionary> => {
  const measurementDictionary = new NestedRecord<
    CBQualitativeMeasurementTypeDefinition | CBQuantitativeMeasurementTypeDefinition
  >();
  const uniqueTsns = [...new Set(tsns)];

  const measurements = await Promise.all(uniqueTsns.map((tsn) => critterbaseService.getTaxonMeasurements(tsn)));

  // Note: This makes the assumption that a qualitative measurement and a quantitative measurement
  // will not have the same measurement name for a given TSN.
  uniqueTsns.forEach((tsn, index) => {
    const qualitativeMeasurements = measurements[index].qualitative;
    const quantitativeMeasurements = measurements[index].quantitative;

    qualitativeMeasurements.forEach((measurement) => {
      // Set the measurement by the measurement name
      measurementDictionary.set({
        // Implicitly handles casing (lowercase)
        path: [tsn, measurement.measurement_name],
        value: measurement
      });

      // Set the measurement by the taxon measurement id
      measurementDictionary.set({
        path: [tsn, measurement.taxon_measurement_id],
        value: measurement
      });
    });

    quantitativeMeasurements.forEach((measurement) => {
      // Set the measurement by the measurement name
      measurementDictionary.set({
        // Implicitly handles casing (lowercase)
        path: [tsn, measurement.measurement_name],
        value: measurement
      });

      // Set the measurement by the taxon measurement id
      measurementDictionary.set({
        path: [tsn, measurement.taxon_measurement_id],
        value: measurement
      });
    });
  });

  return measurementDictionary;
};

export const measurementDependencies = {
  getTsnMeasurementDictionary: getTsnMeasurementDictionaryCore
};

export const getTsnMeasurementDictionary = async (
  tsns: number[],
  critterbaseService: CritterbaseService
): Promise<TSNMeasurementDictionary> => {
  return measurementDependencies.getTsnMeasurementDictionary(tsns, critterbaseService);
};
