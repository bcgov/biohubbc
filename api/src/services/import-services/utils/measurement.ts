import {
  CBQualitativeMeasurement,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurement,
  CBQuantitativeMeasurementTypeDefinition
} from '../../critterbase-service';

/**
 * Check if an object is a `CBQuantitativeMeasurementTypeDefinition`
 *
 * Returns true if the object has the properties `unit` and `taxon_measurement_id`
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQuantitativeMeasurementTypeDefinition
 */
export const isCBQuantitativeMeasurementTypeDefinition = (
  measurement: Record<string, unknown>
): measurement is CBQuantitativeMeasurementTypeDefinition => {
  return measurement && 'unit' in measurement && 'taxon_measurement_id' in measurement;
};

/**
 * Check if an object is a `CBQualitativeMeasurementTypeDefinition`
 *
 * Returns true if the object has the properties `options` and `taxon_measurement_id`
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQualitativeMeasurementTypeDefinition
 */
export const isCBQualitativeMeasurementTypeDefinition = (
  measurement: Record<string, unknown>
): measurement is CBQualitativeMeasurementTypeDefinition => {
  return measurement && 'options' in measurement && 'taxon_measurement_id' in measurement;
};

/**
 * Check if an object is a `CBQualitativeMeasurement` - ie: the recorded mesasurement
 *
 * Returns true if the object has the properties `qualitative_option_id` and `taxon_measurement_id`
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQualitativeMeasurement
 */
export const isCBQualitativeMeasurement = (
  measurement: Record<string, unknown>
): measurement is CBQualitativeMeasurement => {
  return measurement && 'qualitative_option_id' in measurement && 'taxon_measurement_id' in measurement;
};

/**
 * Check if an object is a `CBQuantitativeMeasurement` - ie: the recorded mesasurement
 *
 * Returns true if the object has the properties `value` and `taxon_measurement_id`
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQuantitativeMeasurement
 */
export const isCBQuantitativeMeasurement = (
  measurement: Record<string, unknown>
): measurement is CBQuantitativeMeasurement => {
  return measurement && 'value' in measurement && 'taxon_measurement_id' in measurement;
};
