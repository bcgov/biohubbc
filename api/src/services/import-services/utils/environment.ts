import {
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../../../repositories/observation-subcount-environment-repository';

/**
 * Check if an object is a `QuantitativeEnvironmentTypeDefinition`
 *
 * Returns true if the object has the properties `unit` and `taxon_measurement_id`
 *
 * @param {any} environment - The object to check
 * @returns {boolean} True if the object is a QuantitativeEnvironmentTypeDefinition
 */
export const isQuantitativeEnvironmentTypeDefinition = (
  environment: unknown
): environment is QuantitativeEnvironmentTypeDefinition => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'unit' in environment &&
    'environment_quantitative_id' in environment
  );
};

/**
 * Check if an object is a `QualitativeEnvironmentTypeDefinition`
 *
 * Returns true if the object has the properties `options` and `taxon_measurement_id`
 *
 * @param {unknown} environment - The object to check
 * @returns {boolean} True if the object is a QualitativeEnvironmentTypeDefinition
 */
export const isQualitativeEnvironmentTypeDefinition = (
  environment: unknown
): environment is QualitativeEnvironmentTypeDefinition => {
  return (
    typeof environment === 'object' &&
    environment != null &&
    'options' in environment &&
    'environment_qualitative_id' in environment
  );
};

///**
// * Check if an object is a `CBQualitativeMeasurement` - ie: the recorded mesasurement
// *
// * Returns true if the object has the properties `qualitative_option_id` and `taxon_measurement_id`
// *
// * @param {unknown} environment - The object to check
// * @returns {boolean} True if the object is a CBQualitativeMeasurement
// */
//export const isQualitativeEnvironment = (environment: unknown): environment is CBQualitativeMeasurement => {
//  return (
//    typeof environment === 'object' &&
//    environment != null &&
//    'qualitative_option_id' in environment &&
//    'taxon_measurement_id' in environment
//  );
//};
//
///**
// * Check if an object is a `CBQuantitativeMeasurement` - ie: the recorded mesasurement
// *
// * Returns true if the object has the properties `value` and `taxon_measurement_id`
// *
// * @param {unknown} environment - The object to check
// * @returns {boolean} True if the object is a CBQuantitativeMeasurement
// */
//export const isCBQuantitativeEnvironment = (environment: unknown): environment is CBQuantitativeMeasurement => {
//  return (
//    typeof environment === 'object' &&
//    environment != null &&
//    'value' in environment &&
//    'taxon_measurement_id' in environment
//  );
//};
