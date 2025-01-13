import {
  CBQualitativeMeasurement,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurement,
  CBQuantitativeMeasurementTypeDefinition
} from '../../critterbase-service';

/**
 * Check if an object is a CBQuantitativeMeasurementTypeDefinition
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQuantitativeMeasurementTypeDefinition
 */
export const isCBQuantitativeMeasurementTypeDefinition = (
  measurement: Record<string, unknown>
): measurement is CBQuantitativeMeasurementTypeDefinition => {
  return 'unit' in measurement && 'taxon_measurement_id' in measurement;
};

/**
 * Check if an object is a CBQualitativeMeasurementTypeDefinition
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQualitativeMeasurementTypeDefinition
 */
export const isCBQualitativeMeasurementTypeDefinition = (
  measurement: Record<string, unknown>
): measurement is CBQualitativeMeasurementTypeDefinition => {
  return 'options' in measurement && 'taxon_measurement_id' in measurement;
};

/**
 * Check if an object is a CBQualitativeMeasurement
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQualitativeMeasurement
 */
export const isCBQualitativeMeasurement = (
  measurement: Record<string, unknown>
): measurement is CBQualitativeMeasurement => {
  return 'qualitative_option_id' in measurement && 'measurement_qualitative_id' in measurement;
};

/**
 * Check if an object is a CBQuantitativeMeasurement
 *
 * @param {Record<string, unknown>} measurement - The object to check
 * @returns {boolean} True if the object is a CBQuantitativeMeasurement
 */
export const isCBQuantitativeMeasurement = (
  measurement: Record<string, unknown>
): measurement is CBQuantitativeMeasurement => {
  return 'value' in measurement && 'measurement_quantitative_id' in measurement;
};
